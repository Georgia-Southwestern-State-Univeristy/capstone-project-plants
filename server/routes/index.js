import express from 'express';
import authRoutes from './authRoutes.js';
import plantRoutes from './plantRoutes.js';
import visionRoutes from './visionRoutes.js';
import userRoutes from './userRoutes.js';
import openaiRoutes from './openaiRoutes.js'; // If OpenAI-related logs stay here
import cacheRoutes from './cacheRoutes.js'; // If caching needs its own route

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);       // Authentication routes (Google sign-in, etc.)
router.use('/plants', plantRoutes);    // Plant-related API routes
router.use('/vision', visionRoutes);   // Google Vision AI-related routes
router.use('/users', userRoutes);      // User-related routes
router.use('/openai', openaiRoutes);   // OpenAI-related functionality
router.use('/cache', cacheRoutes);     // Redis caching operations

export default router;
