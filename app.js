const path = require('path');
const fs = require('fs').promises;
const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');

const in5=479.999999993;
const in7=671.9999999902;

function processAndSplitImage(inputPath, outputPath, width, height) {
  return new Promise((resolve, reject) => {
    Jimp.read(inputPath)
      .then((image) => {
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

          leftHalf.write(leftOutputPath),
          rightHalf.write(rightOutputPath),

          resolve([leftOutputPath, rightOutputPath]);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

// Process and split "man.jpg"
const processMan = processAndSplitImage(path.join(__dirname, 'man.jpg'), 'man-small', in7, in5);

// Process and split "anim.jpg"
const processAnim = processAndSplitImage(path.join(__dirname, 'anim.jpg'), 'anim-small', in7, in5);

//not a reusabale function is just for this situation to swap the second path with the third to shuffle the images in the canvas
function swapImagesPaths(imagesPaths) {
  const temp=imagesPaths[3];
  imagesPaths[3]=imagesPaths[1];
  imagesPaths[1]=temp;
}

// Wait for both promises to resolve
Promise.all([processMan, processAnim])
  .then(async (outputPaths) => {
    // Flatten the array of output paths
    const imagePaths = outputPaths.flat();

    swapImagesPaths(imagePaths)

    // Load images into canvas
    const canvas = createCanvas(in7 * 2, in5);
    const ctx = canvas.getContext('2d');

    const halfWidth = Math.floor(in7 / 2);

    const loadAndDrawImages = async () => {
      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        

        try {
          const buffer = await fs.readFile(imagePath);
          const base64 = buffer.toString('base64');
          const img = await loadImage(`data:image/jpeg;base64,${base64}`);
          ctx.drawImage(img, i * halfWidth, 0, halfWidth, in5);
        } catch (loadErr) {
          console.error(`Error loading image from ${imagePath}:`, loadErr);
          throw loadErr; // Propagate the error
        }
      }

      // Convert canvas to base64
      const b64 = canvas.toDataURL().split(';base64,').pop();

      // Save the final merged image to a file
      const mergedOutputPath = path.join(__dirname, 'final-merged-image.jpg');
      await fs.writeFile(mergedOutputPath, b64, 'base64');
      console.log('Merged image saved:', mergedOutputPath);
    };

    // Load and draw images onto the canvas
    await loadAndDrawImages();
  })
  .catch((err) => {
    console.error('Error in image processing:', err);
  });