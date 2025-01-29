// services/cache.js
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

export const cache = {
  async set(key, value, ttl = 3600) {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  },

  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async del(key) {
    await redis.del(key);
  },

  async setImage(key, imageBuffer, ttl = 3600) {
    await redis.set(key, imageBuffer, 'EX', ttl);
  },

  async getImage(key) {
    return redis.getBuffer(key);
  }
}