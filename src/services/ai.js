
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/utils/firebase';
import { cache } from './cache';
import { logger } from './logging';
import axios from 'axios';

// Request configuration

const PERENUAL_API = 'https://perenual.com/api/v1';
const OPEN_IMAGES_PLANTS = 'https://storage.googleapis.com/openimages/v6/oidv6-train-annotations-human-imagelabels.csv';

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

// analyzeImage function in ai.js
export const analyzeImage = async (imageFile) => {
  try {
    // First get Vision AI results
    const imageBuffer = await getImageBuffer(imageFile);
    const visionResults = await visionService.detectPlants(imageBuffer);
 
    // If Vision AI detects a plant, get detailed info from Perenual
    if (visionResults.labels.some(label => 
      label.description.toLowerCase().includes('plant') || 
      label.description.toLowerCase().includes('flower'))) {
      const plantDetails = await getPerenualDetails(visionResults.labels[0].description);
      return {
        basicAnalysis: visionResults,
        detailedInfo: plantDetails,
        confidence: visionResults.labels[0].score,
        recommendations: generateRecommendations(plantDetails)
      };
    }
 
    return {
      basicAnalysis: visionResults,
      confidence: visionResults.labels[0].score
    };
 
  } catch (error) {
    logger.logError('Error in plant analysis:', error);
    throw new AIServiceError('Failed to analyze plant image', 'ANALYSIS_ERROR', error);
  }
};
 
// Get detailed plant information from Perenual
async function getPerenualDetails(plantName) {
  try {
    const response = await axios.get(`${PERENUAL_API}/species-list`, {
      params: {
        key: process.env.VUE_APP_PERENUAL_API_KEY,
        q: plantName
      }
    });
 
    if (response.data.data && response.data.data.length > 0) {
      // Get detailed info for the first match
      const speciesId = response.data.data[0].id;
      const detailsResponse = await axios.get(`${PERENUAL_API}/species/details/${speciesId}`, {
        params: {
          key: process.env.VUE_APP_PERENUAL_API_KEY
        }
      });
 
      return {
        name: detailsResponse.data.common_name,
        scientific_name: detailsResponse.data.scientific_name,
        care_level: detailsResponse.data.care_level,
        watering: detailsResponse.data.watering,
        sunlight: detailsResponse.data.sunlight,
        cycle: detailsResponse.data.cycle
      };
    }
    return null;
  } catch (error) {
    logger.logError('Perenual API Error:', error);
    return null;
  }
}
 
// Generate care recommendations based on plant details
function generateRecommendations(plantDetails) {
  if (!plantDetails) return [];
 
  const recommendations = [];
 
  if (plantDetails.watering) {
    recommendations.push({
      type: 'watering',
      instruction: `Watering needs: ${plantDetails.watering}`,
      priority: 'high'
    });
  }
 
  if (plantDetails.sunlight) {
    recommendations.push({
      type: 'sunlight',
      instruction: `Sunlight needs: ${plantDetails.sunlight.join(' or ')}`,
      priority: 'high'
    });
  }
 
  if (plantDetails.care_level) {
    recommendations.push({
      type: 'general',
      instruction: `Care level: ${plantDetails.care_level}`,
      priority: 'medium'
    });
  }
 
  return recommendations;
}