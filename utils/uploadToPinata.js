const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

const storeImages = async (imagesFilePath) => {
  const fullImagesPath = path.resolve(imagesFilePath); // => for me it will be C:\Users\.......\randomNft
  // Filter the files in case the are a file that in not a .png
  const files = fs.readdirSync(fullImagesPath).filter((file) => file.includes(".png"));
  console.log(files);
  //   console.log(fullImagesPath)
  let responses = [];
  console.log("Uploading images to IPFS ...");

  for (const fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      await pinata
        .pinFileToIPFS(readableStreamForFile, options)
        .then((result) => {
          responses.push(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  }
  return { responses, files };
};

module.exports = { storeImages };
