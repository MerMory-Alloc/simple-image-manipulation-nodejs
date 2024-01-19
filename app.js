const path = require('path');
const fs = require('fs').promises;
const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');

async function processAndSplitImage(inputPath, outputPath, width, height) {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await Jimp.read(inputPath);
      // Resize the image
      image.resize(width, height);

      // Split the image into two halves vertically
      const halfWidth = Math.floor(width / 2);
      const leftHalf = image.clone().crop(0, 0, halfWidth, height);
      const rightHalf = image.clone().crop(halfWidth, 0, halfWidth, height);

      // Construct complete output paths
      const leftOutputPath = path.join(__dirname, outputPath + '-left.jpg');
      const rightOutputPath = path.join(__dirname, outputPath + '-right.jpg');

      // Save the left and right halves
      await leftHalf.write(leftOutputPath);
      await rightHalf.write(rightOutputPath);

      resolve([leftOutputPath, rightOutputPath]);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

async function mergeImages(outputPath, imagePaths, dimensions) {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = createCanvas(dimensions.width * 2, dimensions.height);
      const ctx = canvas.getContext('2d');

      const halfWidth = Math.floor(dimensions.width / 2);

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        const buffer = await fs.readFile(imagePath);
        const base64 = buffer.toString('base64');
        const img = await loadImage(`data:image/jpeg;base64,${base64}`);
        ctx.drawImage(img, i * halfWidth, 0, halfWidth, dimensions.height);
      }

      // Convert canvas to base64
      const b64 = canvas.toDataURL().split(';base64,').pop();

      // Save the final merged image to a file
      const mergedOutputPath = path.join(__dirname, outputPath);
      await fs.writeFile(mergedOutputPath, b64, 'base64');
      console.log('Merged image saved:', mergedOutputPath);

      resolve(mergedOutputPath);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

module.exports = {
  processAndSplitImage,
  mergeImages,
};