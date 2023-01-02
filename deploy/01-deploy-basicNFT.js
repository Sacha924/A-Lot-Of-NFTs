const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, logs } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("_".repeat(50)); // log is a function provided by the Hardhat runtime environment that can be used to print messages to the console.
  const args = [];
  const basicNft = await deploy("BasicNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying ...");
    await verify(basicNft.address, args);
  }
  console.log("_".repeat(50));
};
