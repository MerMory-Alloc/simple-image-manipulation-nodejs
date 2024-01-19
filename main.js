const path = require('path');
const { processAndSplitImage, mergeImages } = require('./imageProcessor');

const in5 = 479.999999993;
const in7 = 671.9999999902;

// Process and split "man.jpg"
const processMan = processAndSplitImage(path.join(__dirname, 'man.jpg'), 'man-small', in7, in5);

// Process and split "anim.jpg"
const processAnim = processAndSplitImage(path.join(__dirname, 'anim.jpg'), 'anim-small', in7, in5);

// Wait for both promises to resolve
Promise.all([processMan, processAnim])
  .then(async (outputPaths) => {
    // Flatten the array of output paths
    const imagePaths = outputPaths.flat();

    // Example of using the mergeImages function
    await mergeImages('final-merged-image.jpg', imagePaths, { width: in7, height: in5 });
  })
  .catch((err) => {
    console.error('Error in image processing:', err);
  });

