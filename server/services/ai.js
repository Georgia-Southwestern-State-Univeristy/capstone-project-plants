import axios from 'axios';
import { storage } from "../utils/firebase.js"; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logger } from './logging';
import { cache } from './cache';
import vision from '@google-cloud/vision';
import { OAuth2Client } from 'google-auth-library';

// Initialize Vision AI client
const auth = new OAuth2Client({
  clientId: process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID,
});
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  auth: auth,
  numericEnums: true
});

// Perenual API configuration
const PERENUAL_API_BASE = 'https://perenual.com/api';
const PERENUAL_API_KEY = process.env.VUE_APP_PERENUAL_API_KEY;

// Cache durations
const CACHE_DURATIONS = {
  IMAGE_ANALYSIS: 24 * 60 * 60,
  PLANT_CARE: 12 * 60 * 60,
  DISEASE_CHECK: 6 * 60 * 60
};

class AIServiceError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Helper function to generate natural language responses
const generateNaturalResponse = (analysis) => {
  const responses = {
    healthy: [
      `Your plant appears to be in good health! The ${analysis.species} shows typical healthy characteristics.`,
      `Great news! Your ${analysis.species} is looking healthy and vibrant.`
    ],
    diseased: [
      `I notice some concerning signs on your ${analysis.species}. ${analysis.diseaseDetails}`,
      `Your plant might need some attention. I've detected ${analysis.diseaseDetails} on your ${analysis.species}.`
    ]
  };
  
  return responses[analysis.health ? 'healthy' : 'diseased'][
    Math.floor(Math.random() * responses[analysis.health ? 'healthy' : 'diseased'].length)
  ];
};

export const analyzeImage = async (imageFile) => {
  try {
    if (!imageFile) {
      throw new AIServiceError('No image file provided', 'INVALID_INPUT');
    }

    // Validate file type and size
    if (!imageFile.type.startsWith('image/')) {
      throw new AIServiceError('Invalid file type. Only images are allowed', 'INVALID_FILE_TYPE');
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new AIServiceError('File too large. Maximum size is 5MB', 'FILE_TOO_LARGE');
    }

    // Check cache
    const cacheKey = `image_analysis_${imageFile.name}_${imageFile.size}`;
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      logger.logInfo('Retrieved analysis from cache', { cacheKey });
      return cachedResult;
    }

    // Upload to Firebase Storage
    const storageRef = ref(storage, `plant-images/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // Analyze with Vision AI
    const [visionResult] = await visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'IMAGE_PROPERTIES' }
      ]
    });

    // Extract plant-related labels
    const plantLabels = visionResult.labelAnnotations
      .filter(label => label.description.toLowerCase().includes('plant') ||
                      label.description.toLowerCase().includes('flower') ||
                      label.description.toLowerCase().includes('tree'))
      .map(label => ({
        name: label.description,
        confidence: label.score
      }));

    // Get detailed plant information from Perenual API
    const plantDetails = await Promise.all(
      plantLabels.map(async (label) => {
        const response = await axios.get(`${PERENUAL_API_BASE}/species-list`, {
          params: {
            key: PERENUAL_API_KEY,
            q: label.name
          }
        });
        return response.data.data[0];
      })
    );

    // Analyze plant health
    const healthAnalysis = await analyzeHealth(imageUrl);

    // Compile final analysis
    const analysis = {
      species: plantDetails[0]?.common_name || plantLabels[0]?.name,
      scientificName: plantDetails[0]?.scientific_name,
      confidence: plantLabels[0]?.confidence,
      health: healthAnalysis.isHealthy,
      diseaseDetails: healthAnalysis.details,
      careInstructions: plantDetails[0]?.care_instructions || await getPlantCareAdvice(plantLabels[0]?.name),
      timestamp: new Date().toISOString()
    };

    // Generate natural language response
    const naturalResponse = generateNaturalResponse(analysis);

    const result = {
      imageUrl,
      analysis,
      naturalResponse
    };

    // Cache the result
    await cache.set(cacheKey, result, CACHE_DURATIONS.IMAGE_ANALYSIS);

    return result;
  } catch (error) {
    logger.logError('Error in image analysis:', error);
    throw new AIServiceError(
      'Failed to analyze image',
      'ANALYSIS_ERROR',
      error
    );
  }
};

const analyzeHealth = async (imageUrl) => {
  try {
    // Analyze image with Vision AI for disease detection
    const [result] = await visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'CROP_HINTS' }
      ]
    });

    // Analyze color properties for health indicators
    const colors = result.imagePropertiesAnnotation.dominantColors.colors;
    const hasHealthyGreen = colors.some(color => 
      color.color.green > color.color.red && 
      color.color.green > color.color.blue &&
      color.score > 0.3
    );

    // Detect potential disease patterns
    const unhealthyPatterns = result.localizedObjectAnnotations.filter(obj =>
      obj.name.toLowerCase().includes('spot') ||
      obj.name.toLowerCase().includes('lesion') ||
      obj.name.toLowerCase().includes('damage')
    );

    return {
      isHealthy: hasHealthyGreen && unhealthyPatterns.length === 0,
      details: unhealthyPatterns.length > 0
        ? `Detected potential issues: ${unhealthyPatterns.map(p => p.name).join(', ')}`
        : 'No visible health issues detected'
    };
  } catch (error) {
    logger.logError('Error in health analysis:', error);
    throw new AIServiceError('Failed to analyze plant health', 'HEALTH_ANALYSIS_ERROR', error);
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

    // Get detailed care information from Perenual API
    const response = await axios.get(`${PERENUAL_API_BASE}/species-care-guide-list`, {
      params: {
        key: PERENUAL_API_KEY,
        q: plantInfo
      }
    });

    const careGuide = response.data.data[0];
    const advice = {
      watering: careGuide?.watering,
      sunlight: careGuide?.sunlight,
      soil: careGuide?.soil,
      temperature: careGuide?.temperature,
      humidity: careGuide?.humidity,
      fertilization: careGuide?.fertilization,
      pruning: careGuide?.pruning,
      naturalResponse: `Here's how to care for your ${plantInfo}: Water ${careGuide?.watering}. It needs ${careGuide?.sunlight} and prefers ${careGuide?.soil} soil. Keep temperature at ${careGuide?.temperature} and humidity at ${careGuide?.humidity}.`
    };

    await cache.set(cacheKey, advice, CACHE_DURATIONS.PLANT_CARE);
    return advice;
  } catch (error) {
    logger.logError('Error getting plant care advice:', error);
    throw new AIServiceError('Failed to get plant care advice', 'ADVICE_ERROR', error);
  }
};