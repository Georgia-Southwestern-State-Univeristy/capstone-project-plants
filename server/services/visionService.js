import vision from "@google-cloud/vision";
import dotenv from "dotenv";
import path from "path";

dotenv.config(); // Load environment variables

// ✅ Ensure GOOGLE_APPLICATION_CREDENTIALS is set correctly
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("❌ Missing GOOGLE_APPLICATION_CREDENTIALS in .env file!");
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const client = new vision.ImageAnnotatorClient(); // ✅ Google Vision API Client

export const analyzeImage = async (imageBuffer) => {
    try {
        console.log("🔍 [Vision Service] Processing Image...");

        const [result] = await client.labelDetection({
            image: { content: imageBuffer.toString("base64") }
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
        console.error("❌ Google Vision API Error:", error);
        throw new Error("Failed to analyze image.");
    }
};
