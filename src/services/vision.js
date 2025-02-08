vision.js
import vision from '@google-cloud/vision';
 
const client = new vision.ImageAnnotatorClient({
keyFilename: process.env.VUE_APP_GOOGLE_APPLICATION_CREDENTIALS
});
 
export const visionService = {
  async detectPlants(imageBuffer) {
    try {
      // Request multiple features for better analysis
      const request = {
        image: {content: imageBuffer},
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION' },
          { type: 'IMAGE_PROPERTIES' }
        ]
      };
 
      const [result] = await client.annotateImage(request);
 
      const labels = result.labelAnnotations;
      const objects = result.localizedObjectAnnotations;
      const colors = result.imagePropertiesAnnotation.dominantColors.colors;
 
      return {
        labels,
        objects,
        colors,
        isPlant: labels.some(label => 
          label.description.toLowerCase().includes('plant') ||
          label.description.toLowerCase().includes('flower') ||
          label.description.toLowerCase().includes('leaf')
        )
      };
 
    } catch (error) {
      console.error('Vision API Error:', error);
      throw error;
    }
  }
};