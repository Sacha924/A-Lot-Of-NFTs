const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");
const { Console } = require("console");

const imagesLocation = "./images/randomNft";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      // This is note usefull here but we can do that for create cards with different features, strength, speed, etc
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, logs } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // We want to upload our images to IPFS so everybody can pin them and work with them
  // Get the IPFS hash of our images, we can do so by using our own ipfs node, or by using pinata (it pins nft for us ^^). Or we can use NFT.storage (fully decentralized)
  let tokenUris = ["ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo", "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d", "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm"];
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }

  let vrfCoordinatorV2Address, subscriptionId;
  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    // console.log(txReceipt.events[0].args.subId.toNumber());
    // subscriptionId = transactionReceipt.events[0].args.subId

    subscriptionId = txReceipt.events[0].args.subId.toNumber();
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  console.log("-".repeat(50));

  // The args are inside the constructor : constructor(address vrfCoordinatorV2, uint64 subscriptionId, bytes32 gasLane, uint32 callbackGasLimit, string[3] memory dogTokenUris, uint256 mintFee)
  const args = [vrfCoordinatorV2Address, subscriptionId, networkConfig[chainId]["gasLane"], networkConfig[chainId]["mintFee"], networkConfig[chainId]["callbackGasLimit"], tokenUris];
  console.log(args);

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying ...");
    await verify(randomIpfsNft.address, args);
  }
  console.log("_".repeat(50));
};

const handleTokenUris = async () => {
  tokenUris = [];
  // We need to both store the image and the metadatas in IPFS
  const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);
  for (let imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs uploaded! They are:");
  console.log(tokenUris);
  return tokenUris;
};

module.exports.tags = ["all", "randomipfs", "main"];
