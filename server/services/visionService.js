import vision from '@google-cloud/vision';
// import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
// import { getStorage } from 'firebase-admin/storage';

dotenv.config();
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const client = new vision.ImageAnnotatorClient(); // Uses GOOGLE_APPLICATION_CREDENTIALS

//Analyze image
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