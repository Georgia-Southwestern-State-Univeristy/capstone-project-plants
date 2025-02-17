// server/redisConnection.js
import Redis from 'ioredis';




function createConnection(config) {
  return new Redis({
    host: process.env.VITE_APP_REDIS_HOST,
    port: process.env.VITE_APP_REDIS_PORT,
    username: process.env.VITE_APP_REDIS_NAMENAME,
    password: process.env.VITE_APP_REDIS_PASSWORD,
    ...config
  });
}

module.exports = {
  createConnection
};