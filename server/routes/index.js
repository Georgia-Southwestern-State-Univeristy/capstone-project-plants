import express from 'express'; 
import authRoutes from './authRoutes.js';
import plantRoutes from './plantRoutes.js';
import chatRoutes from './chatRoutes.js';  // ✅ Replaces separate OpenAI & Vision routes
import userRoutes from './userRoutes.js';
import cacheRoutes from './cacheRoutes.js'; // If caching needs its own route

const router = express.Router();

// ✅ Mount route modules
router.use('/auth', authRoutes);       // Authentication routes (Google sign-in, etc.)
router.use('/plants', plantRoutes);    // Plant-related API routes
router.use('/chat', chatRoutes);       // ✅ Combined OpenAI + Vision chat functionality
router.use('/users', userRoutes);      // User-related routes
router.use('/cache', cacheRoutes);     // Redis caching operations (if needed)

export default router;
