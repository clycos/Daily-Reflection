const fs = require('fs');

// Function to encode JSON to Base64
function encodeJSON(inputFile, outputFile) {
  // Read the original JSON file
  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    // Convert JSON to Base64
    const base64Encoded = Buffer.from(data).toString('base64');

    // Save the Base64-encoded JSON to a new file
    fs.writeFile(outputFile, JSON.stringify({ encoded: base64Encoded }, null, 2), (err) => {
      if (err) {
        console.error('Error writing encoded file:', err);
        return;
      }
      console.log(`Encoded JSON saved to ${outputFile}`);
    });
  });
}

encodeJSON('../data/reflections.json', '../data/reflectionse.json');

// run command within scripts folder is: node scripts/encodeJSON.js
