import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Load environment variables

if (!process.env.VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("❌ Missing VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY in .env file!");
}

process.env.VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY = path.resolve(process.env.VITE_APP_FIREBASE_SERVICE_ACCOUNT_KEY);
const client = new vision.ImageAnnotatorClient(); // Uses GOOGLE_APPLICATION_CREDENTIALS

// ✅ Analyze Image Function
export const analyzeImage = async (imageBuffer) => {
    try {
        console.log("🔍 [Vision Service] Processing Image...");
        const [result] = await client.labelDetection({ // ✅ Use labelDetection()
            image: { content: imageBuffer.toString('base64') }
        });

        if (!result || !result.labelAnnotations) {
            console.log("⚠️ [Vision Service] No Labels Found.");
            return [];
        }

        const labels = result.labelAnnotations.map(label => ({
            description: label.description,
            confidence: label.score
        }));

        console.log("✅ [Vision Service] Labels Detected:", labels);
        return labels;
    } catch (error) {
        console.error('❌ Google Vision API Error:', error);
        throw new Error('Failed to analyze image.');
    }
};
