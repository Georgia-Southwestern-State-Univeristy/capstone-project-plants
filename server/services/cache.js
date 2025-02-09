// services/cache.js
import axios from 'axios';

export const cache = {
  async set(key, value, duration) {
    try {
      await axios.post('/api/cache', { key, value, duration });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async get(key) {
    try {
      const response = await axios.get(`/api/cache/${key}`);
      return response.data.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
};