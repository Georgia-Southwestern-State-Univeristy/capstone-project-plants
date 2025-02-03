require('dotenv').config();
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8082;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware should be last
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});