import express from 'express';
import Redis from 'ioredis';

const router = express.Router();

// Initialize Redis connection
const redis = new Redis({
  host: process.env.VUE_APP_REDIS_HOST,
  port: process.env.VUE_APP_REDIS_PORT,
  password: process.env.VUE_APP_REDIS_PASSWORD
});

// Handle Redis errors
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

// Route to set cache value
router.post('/', async (req, res) => {
  try {
    const { key, value, duration } = req.body;
    await redis.set(key, JSON.stringify(value), 'EX', duration);
    res.json({ success: true });
  } catch (error) {
    console.error('Redis set error:', error);
    res.status(500).json({ error: 'Cache operation failed' });
  }
});

// Route to get cached value
router.get('/:key', async (req, res) => {
  try {
    const value = await redis.get(req.params.key);
    res.json({ value: value ? JSON.parse(value) : null });
  } catch (error) {
    console.error('Redis get error:', error);
    res.status(500).json({ error: 'Cache operation failed' });
  }
});

export default router;