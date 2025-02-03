
import Redis from 'ioredis';
import { logger } from './logging';

// Cache durations in seconds
const CACHE_DURATIONS = {
  SHORT: 300,        // 5 minutes
  MEDIUM: 3600,      // 1 hour
  LONG: 86400,       // 24 hours
  VERY_LONG: 604800  // 1 week
};

class CacheError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'CacheError';
    this.code = code;
    this.originalError = originalError;
  }
}

const redis = new Redis({
  host: process.env.VUE_APP_REDIS_HOST || 'localhost',
  port: process.env.VUE_APP_REDIS_PORT || 6379,
  password: process.env.VUE_APP_REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 2000);
    logger.logInfo(`Redis retry attempt ${times} with delay ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('error', (error) => {
  logger.logError('Redis connection error:', error);
});

redis.on('connect', () => {
  logger.logInfo('Redis connected successfully');
});

export const cache = {
  async set(key, value, duration = CACHE_DURATIONS.MEDIUM) {
    try {
      if (!key) {
        throw new CacheError('Cache key is required', 'INVALID_KEY');
      }

      if (value === undefined || value === null) {
        throw new CacheError('Cache value cannot be null or undefined', 'INVALID_VALUE');
      }

      const serializedValue = JSON.stringify(value);
      await redis.set(key, serializedValue, 'EX', duration);
      logger.logInfo(`Cache set successful for key: ${key}`, { duration });
    } catch (error) {
      if (error instanceof CacheError) {
        throw error;
      }
      logger.logError('Cache set error:', error);
      throw new CacheError('Failed to set cache value', 'SET_ERROR', error);
    }
  },

  async get(key) {
    try {
      if (!key) {
        throw new CacheError('Cache key is required', 'INVALID_KEY');
      }

      const value = await redis.get(key);
      if (!value) return null;

      try {
        const parsedValue = JSON.parse(value);
        logger.logInfo(`Cache hit for key: ${key}`);
        return parsedValue;
      } catch (parseError) {
        logger.logError('Cache parse error:', parseError);
        throw new CacheError('Failed to parse cached value', 'PARSE_ERROR', parseError);
      }
    } catch (error) {
      if (error instanceof CacheError) {
        throw error;
      }
      logger.logError('Cache get error:', error);
      throw new CacheError('Failed to get cache value', 'GET_ERROR', error);
    }
  },

  async del(key) {
    try {
      if (!key) {
        throw new CacheError('Cache key is required', 'INVALID_KEY');
      }

      await redis.del(key);
      logger.logInfo(`Cache delete successful for key: ${key}`);
    } catch (error) {
      logger.logError('Cache delete error:', error);
      throw new CacheError('Failed to delete cache value', 'DELETE_ERROR', error);
    }
  },

  async setImage(key, imageBuffer, duration = CACHE_DURATIONS.LONG) {
    try {
      if (!key || !imageBuffer) {
        throw new CacheError('Both key and image buffer are required', 'INVALID_INPUT');
      }

      await redis.set(key, imageBuffer, 'EX', duration);
      logger.logInfo(`Image cache set successful for key: ${key}`);
    } catch (error) {
      logger.logError('Image cache set error:', error);
      throw new CacheError('Failed to cache image', 'IMAGE_SET_ERROR', error);
    }
  },

  async getImage(key) {
    try {
      if (!key) {
        throw new CacheError('Cache key is required', 'INVALID_KEY');
      }

      const imageBuffer = await redis.getBuffer(key);
      if (!imageBuffer) {
        logger.logInfo(`Image cache miss for key: ${key}`);
        return null;
      }

      logger.logInfo(`Image cache hit for key: ${key}`);
      return imageBuffer;
    } catch (error) {
      logger.logError('Image cache get error:', error);
      throw new CacheError('Failed to get cached image', 'IMAGE_GET_ERROR', error);
    }
  },

  DURATIONS: CACHE_DURATIONS
};