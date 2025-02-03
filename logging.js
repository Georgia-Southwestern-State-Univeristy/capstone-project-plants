// src/services/logging.js
import axios from 'axios';

export const logger = {
  async logError(error) {
    return axios.post('/api/log/error', { error });
  },
  
  async logInfo(message) {
    return axios.post('/api/log/info', { message });
  }
};