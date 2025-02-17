import dotenv from 'dotenv';
dotenv.config();
// import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path, {dirname} from 'path';
import { fileURLToPath } from 'url';
import Redis from 'ioredis';

// Import Routes
import routes from './routes/index.js';


// Initialize environment variables and Express app
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

app.use('/api', routes);



// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.use((req, res, next) => {
  console.log(`🟢 Serving static file: ${req.url}`);
  next(); // Pass to next middleware if no static file is found
});
// Use modular routes
app.use('/api', routes);

// ✅ Test route (Ensures `res.status` is properly used)
app.get('/api/test', (req, res) => {
  return res.status(200).json({ message: 'Server is running!' });
});

// ✅ Fix: Ensure `next()` is used in error-handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Ensure res is not already sent
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  next(err); // ✅ Fix: Allows other middleware to handle errors
});

// ✅ Fix: Ensure res is defined before calling `res.status()`
app.use((req, res, next) => {
  if (!res) {
    console.error("❌ Response object is undefined");
    return next(new Error("Server response error"));
  }
  next();
});

// ✅ Fix: Handle all other routes properly
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // ✅ Pass API requests to the next middleware
  }

  const filePath = path.join(__dirname, '../dist/index.html');
  return res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Error serving index.html:", err);
      res.status(500).send("Error loading page");
    }
  });
});

// ✅ Start server with proper logging
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// ✅ Initialize Redis connection
if (typeof window === 'undefined') {
  const redis = new Redis({
    host: process.env.VITE_APP_REDIS_HOST,
    port: process.env.VITE_APP_REDIS_PORT,
    username: process.env.VITE_APP_REDIS_NAMENAME,
    password: process.env.VITE_APP_REDIS_PASSWORD
  });

  // ✅ Fix Redis error handling
  redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });
}


export default app;