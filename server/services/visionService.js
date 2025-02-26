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
            return [{ description: "Unknown Plant", confidence: 0 }];
        }

        // ✅ Log ALL detected labels for debugging
        const allLabels = result.labelAnnotations.map(label => ({
            description: label.description,
            confidence: label.score
        }));
        console.log("✅ [Vision Service] All Labels Detected:", allLabels);

        // ✅ Filter for plant-specific labels and prioritize species names
        const plantLabels = allLabels
            .filter(label => 
                label.description.toLowerCase().includes("plant") || 
                label.description.toLowerCase().includes("flower") ||
                label.description.toLowerCase().includes("tree") ||
                label.description.toLowerCase().includes("daisy") || // Add specific plant keywords
                label.description.toLowerCase().includes("rose") ||
                label.description.toLowerCase().includes("sunflower")
            )
            .sort((a, b) => b.confidence - a.confidence); // ✅ Sort by confidence

        // ✅ Pick the most confident specific label
        const selectedPlant = plantLabels.length > 0 ? plantLabels[0].description : "Unknown Plant";
        console.log("✅ [Vision Service] Most Confident Plant Label:", selectedPlant);

        return [{ description: selectedPlant, confidence: 1 }];
    } catch (error) {
        console.error("❌ Google Vision API Error:", error);
        throw new Error("Failed to analyze image.");
    }
};


