require('dotenv').config();
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const path = require('path');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const { auth } = require('../src/utils/firebase');
const { signInWithCredential, GoogleAuthProvider } = require('firebase/auth');


const app = express();
const PORT = process.env.PORT || 8082;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const googleClient = new OAuth2Client(process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID);



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

app.post('/auth/google-login', async (req, res) => {
  try {
    // Get the ID token from the request body
    const { id_token } = req.body;
    
    if (!id_token) {
      return res.status(400).json({ 
        error: 'Missing ID token' 
      });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID
    });

    // Get user information from the ticket
    const payload = ticket.getPayload();
    
    // Create a Firebase credential
    const credential = GoogleAuthProvider.credential(id_token);
    
    try {
      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Return success response with user data
      res.status(200).json({
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    } catch (firebaseError) {
      console.error('Firebase authentication error:', firebaseError);
      res.status(401).json({
        error: 'Firebase authentication failed',
        details: firebaseError.message
      });
    }

  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });

});

app.options('*', (req, res) => {
  res.sendStatus(200)
});

