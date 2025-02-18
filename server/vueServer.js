import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Redis from 'ioredis';
import routes from './routes/index.js';
import plantRoutes from './routes/plantRoutes.js';

// Initialize environment variables and Express app
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// ✅ Use API routes correctly
app.use('/api', routes);
app.use('/plants', plantRoutes);
// ✅ Handle Vite Development Mode
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // 🔹 Serve static files from the `dist` folder (Production)
  app.use(express.static(path.join(__dirname, '../dist')));
} else {
  console.log("🟢 Running in Development Mode with Vite");
}

// ✅ Fix: Ensure all non-API requests serve `index.html`
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // ✅ Pass API requests to the next middleware
  }

  const filePath = isProduction
    ? path.join(__dirname, '../dist/index.html') // Production build
    : path.join(__dirname, '../index.html'); // Development mode

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Error serving index.html:", err);
      res.status(500).send("Error loading page");
    }
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// ✅ Redis Connection (Optional)
if (typeof window === 'undefined') {
  const redis = new Redis({
    host: process.env.VITE_APP_REDIS_HOST,
    port: process.env.VITE_APP_REDIS_PORT,
    username: process.env.VITE_APP_REDIS_USERNAME,
    password: process.env.VITE_APP_REDIS_PASSWORD
  });

  redis.on('error', (error) => console.error('❌ Redis connection error:', error));
  redis.on('connect', () => console.log('✅ Redis connected successfully'));
}

export default app;
