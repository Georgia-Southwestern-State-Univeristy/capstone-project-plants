
import axios from 'axios';
import { storage } from '@/utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logger } from './logging';
import { cache } from './cache';

// Request configuration
const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '1.0.0'
  },
  timeout: 30000, // 30 second timeout
  validateStatus: status => status >= 200 && status < 300
};

// Cache durations
const CACHE_DURATIONS = {
  IMAGE_ANALYSIS: 24 * 60 * 60, // 24 hours
  PLANT_CARE: 12 * 60 * 60,    // 12 hours
  DISEASE_CHECK: 6 * 60 * 60    // 6 hours
};

// Error types
class AIServiceError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

export const analyzeImage = async (imageFile) => {
  try {
    if (!imageFile) {
      throw new AIServiceError('No image file provided', 'INVALID_INPUT');
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new AIServiceError('Invalid file type. Only images are allowed', 'INVALID_FILE_TYPE');
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new AIServiceError('File too large. Maximum size is 5MB', 'FILE_TOO_LARGE');
    }

    // Check cache first
    const cacheKey = `image_analysis_${imageFile.name}_${imageFile.size}`;
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      logger.logInfo('Retrieved analysis from cache', { cacheKey });
      return cachedResult;
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('timestamp', Date.now());

    // Upload to Firebase Storage
    const storageRef = ref(storage, `plant-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Send for analysis
        const uploadResponse = await axios.post('/api/upload', formData, {
            ...API_CONFIG,
            headers: {
                ...API_CONFIG.headers,
                'Content-Type': 'multipart/form-data'
            }


  });

    // Get analysis
    const analysisResponse = await axios.post('/api/analyze-image', 
      { imageUrl: uploadResponse.data.url },
      API_CONFIG
    );

    // Cache the result
    await cache.set(cacheKey, analysisResponse.data, CACHE_DURATIONS.IMAGE_ANALYSIS);

   
    return {
      imageUrl,    // Return it as part of the response
      analysis: analysisResponse.data
  };
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new AIServiceError(
          `Server error: ${error.response.data.message || 'Unknown error'}`,
          'SERVER_ERROR',
          error
        );
      } else if (error.request) {
        throw new AIServiceError(
          'Network error: No response from server',
          'NETWORK_ERROR',
          error
        );
      }
    }

    throw new AIServiceError(
      'An unexpected error occurred during image analysis',
      'UNKNOWN_ERROR',
      error
    );
  }
};

export const getPlantCareAdvice = async (plantInfo) => {
  try {
    if (!plantInfo?.trim()) {
      throw new AIServiceError('No plant information provided', 'INVALID_INPUT');
    }

    const cacheKey = `plant_advice_${plantInfo}`;
    const cachedAdvice = await cache.get(cacheKey);
    if (cachedAdvice) {
      logger.logInfo('Retrieved plant care advice from cache', { cacheKey });
      return cachedAdvice;
    }

    const response = await axios.post(
      '/api/plant-care',
      { plantInfo },
      API_CONFIG
    );

    await cache.set(cacheKey, response.data.advice, CACHE_DURATIONS.PLANT_CARE);
    return response.data.advice;
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    logger.logError('Error getting plant care advice:', error);
    throw new AIServiceError(
      'Failed to get plant care advice',
      'ADVICE_ERROR',
      error
    );
  }
};