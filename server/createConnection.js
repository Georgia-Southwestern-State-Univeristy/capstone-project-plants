// server/redisConnection.js
const Redis = require('ioredis');



function createConnection(config) {
  return new Redis({
    host: process.env.VUE_APP_REDIS_HOST,
    port: process.env.VUE_APP_REDIS_PORT,
    username: process.env.VUE_APP_REDIS_NAMENAME,
    password: process.env.VUE_APP_REDIS_PASSWORD,
    ...config
  });
}

module.exports = {
  createConnection
};