import 'dotenv/config';
import express from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';
import multer from 'multer';
import { OAuth2Client } from 'google-auth-library';
import { auth } from './utils/firebase.js';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import cors from 'cors';
import Redis from 'ioredis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8082;


// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID);

// Initialize Vision AI client
const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.VUE_APP_GOOGLE_APPLICATION_CREDENTIALS
});

app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});


// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    // Add this specifically for ES modules
    if (filePath.includes('type="module"')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
// API Routes
// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Plant analysis route
// In vueServer.js
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    const [result] = await visionClient.annotateImage({
      image: { content: req.file.buffer },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'IMAGE_PROPERTIES' }
      ]
    });
    res.json(result);
  } catch (error) {
    console.error('Vision API Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});
// Logging routes
app.post('/api/log/error', (req, res) => {
  console.error('Client Error:', req.body.error);
  res.status(200).json({ message: 'Error logged' });
});

app.post('/api/log/info', (req, res) => {
  console.info('Client Info:', req.body.message);
  res.status(200).json({ message: 'Info logged' });
});

// Authentication route
app.post('/auth/google-login', async (req, res) => {
  try {
    const { id_token } = req.body;
    
    if (!id_token) {
      return res.status(400).json({ error: 'Missing ID token' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const credential = GoogleAuthProvider.credential(id_token);
    
    try {
      const userCredential = await signInWithCredential(auth, credential);
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

// Options handling for CORS
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Error handling middleware (Fix: Add `next` parameter)
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const redis = new Redis({
  host: process.env.VUE_APP_REDIS_HOST,
  port: process.env.VUE_APP_REDIS_PORT,
  password: process.env.VUE_APP_REDIS_PASSWORD
});

// Add error handling
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});


app.post('/api/cache', async (req, res) => {
  try {
    const { key, value, duration } = req.body
    await redis.set(key, JSON.stringify(value), 'EX', duration)
    res.json({ success: true })
  } catch (error) {
    console.error('Redis set error:', error)
    res.status(500).json({ error: 'Cache operation failed' })
  }
})

app.get('/api/cache/:key', async (req, res) => {
  try {
    const value = await redis.get(req.params.key)
    res.json({ value: value ? JSON.parse(value) : null })
  } catch (error) {
    console.error('Redis get error:', error)
    res.status(500).json({ error: 'Cache operation failed' })
  }
});