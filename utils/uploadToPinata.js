const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");

const storeImages = async (imagesFilePath) => {
  const fullImagesPath = path.resolve(imagesFilePath); // => ../images/....../ourImage.png

  // Filter the files in case the are a file that in not a .png
  const files = fs.readdirSync(fullImagesPath).filter((file) => file.includes(".png"));
  console.log(files);
};

module.exports = { storeImages };
