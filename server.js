const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json({ limit: '10mb' })); 

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// Serve images from the 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/photo', express.static(path.join(__dirname, 'photo')));

// Ensure 'photo' directory exists
const photoDir = path.join(__dirname, 'photo');
if (!fs.existsSync(photoDir)) {
    fs.mkdirSync(photoDir);
}

// Endpoint to save the image
app.post('/save-image', (req, res) => {
  const imageData = req.body.image.replace(/^data:image\/png;base64,/, ""); // Remove header
  const fileName = `calligraphy_${Date.now()}.png`; // Unique name
  const filePath = path.join(photoDir, fileName);

  fs.writeFile(filePath, imageData, 'base64', (err) => {
      if (err) {
          console.error('Error saving image:', err);
          return res.status(500).json({ success: false, message: 'Error saving image' });
      }
      res.json({ success: true, filename: fileName });
  });
});

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

// Redirect the root (/) to settings.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
