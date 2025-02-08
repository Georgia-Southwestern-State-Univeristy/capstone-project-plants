// src/services/logging.js
const axios = require('axios');

const logger = {
  async logError(error) {
    return axios.post('/api/log/error', { error });
  },
  
  async logInfo(message) {
    return axios.post('/api/log/info', { message });
  }
};

module.exports = { logger };