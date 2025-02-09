import authRoutes from './routes/authRoutes.js';
import openaiRoutes from './routes/openaiRoutes.js';
import userRoutes from './routes/userRoutes.js';

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';
import multer from 'multer';
import { OAuth2Client } from 'google-auth-library';
import { adminAuth  } from './utils/firebaseAdmin.js'; 
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import cors from 'cors'; // ✅ CORS for frontend requests
import Redis from 'ioredis';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ✅ Define __dirname manually for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

//Register routes
app.use('/auth', authRoutes);
app.use('/openai', openaiRoutes);
app.use('/user', userRoutes);

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

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  extensions: ['html', 'js', 'css'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// API Routes
// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Plant analysis route
app.post('/api/analyze-plant', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Analyze image with Vision AI
    const [result] = await visionClient.annotateImage({
      image: { content: req.file.buffer },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'IMAGE_PROPERTIES' }
      ]
    });

    res.json({ analysis: result });
  } catch (error) {
    console.error('Plant analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze plant image' });
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
      const userCredential = await signInWithCredential(adminAuth , credential);
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

// Create API endpoints for cache operations
app.get('/api/cache/:key', async (req, res) => {
  try {
    const value = await redis.get(req.params.key);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cache', async (req, res) => {
  try {
    const { key, value, duration } = req.body;
    await redis.set(key, value, 'EX', duration);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});