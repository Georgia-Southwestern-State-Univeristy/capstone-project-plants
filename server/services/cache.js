// src/services/cacheService.js
import axios from 'axios'

export const cacheService = {
  async set(key, value, duration) {
    try {
      await axios.post('/api/cache', {
        key,
        value,
        duration
      })
    } catch (error) {
      console.error('Cache set error:', error)
      throw error
    }
  },

  async get(key) {
    try {
      const response = await axios.get(`/api/cache/${key}`)
      return response.data.value
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
}