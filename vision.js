import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
 keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export const visionService = {
 async detectPlants(imageBuffer) {
   const [result] = await client.labelDetection({
     image: {content: imageBuffer}
   });
   return result.labelAnnotations.filter(label => 
     label.description.toLowerCase().includes('plant') ||
     label.description.toLowerCase().includes('flower')
   );
 },

 async detectDiseases(imageBuffer) {
   const [result] = await client.objectLocalization({
     image: {content: imageBuffer}
   });
   return result.localizedObjectAnnotations;
 }
};