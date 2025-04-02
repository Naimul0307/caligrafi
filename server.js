const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// Serve images from the 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Endpoint to fetch image filenames from the 'images' folder
app.get('/get-images', (req, res) => {
  const imagesDirectory = path.join(__dirname, 'images');
  
  // Read all files in the images directory
  fs.readdir(imagesDirectory, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan images directory');
    }

    // Filter out files that are not images (by checking common image extensions)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
    const images = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));

    res.json(images); // Send the list of images as a JSON response
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
