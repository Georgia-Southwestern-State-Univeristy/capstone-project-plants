import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Load environment variables

// ✅ Ensure Google Credentials Path is Set Correctly
if (!process.env.VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("❌ Missing VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY in .env file!");
}

process.env.VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY = path.resolve(process.env.VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY);
const client = new vision.ImageAnnotatorClient(); // Uses GOOGLE_APPLICATION_CREDENTIALS

// ✅ Analyze Image Function
export const analyzeImage = async (imageBuffer) => {
    try {
        const [result] = await client.annotateImage({
            image: { content: imageBuffer.toString('base64') },
            features: [{ type: 'LABEL_DETECTION' }, { type: 'OBJECT_LOCALIZATION' }]
        });

        return result.labelAnnotations.map(label => ({
            description: label.description,
            confidence: label.score
        }));
    } catch (error) {
        console.error('Google Vision API Error:', error);
        throw new Error('Failed to analyze image.');
    }
};


//  Upload Image to Firebase Storage 
// ================WIll DECIDE LATER==============================================

// export const uploadToStorage = async (imageBuffer, filename) => {
//     try {
//         const bucket = getStorage().bucket();
//         const file = bucket.file(`vision-uploads/${uuidv4()}-${filename}`);
//         await file.save(imageBuffer, { contentType: 'image/jpeg' });

//         return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
//     } catch (error) {
//         console.error('Error uploading to Firebase Storage:', error);
//         throw new Error('Failed to upload image.');
//     }
// };