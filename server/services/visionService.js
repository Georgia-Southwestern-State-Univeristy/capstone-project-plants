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

        // ✅ Log all detected labels for debugging
        const allLabels = result.labelAnnotations.map(label => ({
            description: label.description,
            confidence: label.score
        }));
        console.log("✅ [Vision Service] All Labels Detected:", allLabels);

        // ✅ Ignore generic and color labels
        const ignoredLabels = [
            // ❌ General plant-related terms (too broad)
            "Flower", "Plant", "Plants", "Petal", "Leaf", "Leaves", "Foliage", "Flora",
            "Tree", "Shrub", "Grass", "Herb", "Stem", "Branch", "Botanical", "Garden",
            "Wildflower", "Bloom", "Vegetation", "Seedling", "Bush",
        
            // ❌ Color terms (not helpful for plant identification)
            "Green", "Yellow", "Red", "Blue", "White", "Pink", "Purple", "Orange", "Brown",
            "Black", "Gray", "Violet", "Magenta", "Cyan",
        
            // ❌ Background/Nature terms (not specific to plant species)
            "Field", "Meadow", "Lawn", "Ground", "Soil", "Dirt", "Forest", "Woodland", 
            "Savanna", "Jungle", "Desert", "Swamp", "Pond", "River", "Water", "Landscape",
        
            // ❌ Non-botanical descriptive words
            "Close-up", "Macro photography", "Natural environment", "Scenery", "Outdoor",
            "Wild", "Park", "Background", "Sunny", "Cloudy", "Weather", "Daytime", "Nature"
        ];
        
        const specificLabels = allLabels
            .filter(label => !ignoredLabels.includes(label.description))
            .sort((a, b) => b.confidence - a.confidence); // ✅ Sort by confidence

        // ✅ Pick the most confident specific label
        const selectedPlant = specificLabels.length > 0 ? specificLabels[0].description : "Unknown Plant";
        console.log("✅ [Vision Service] Selected Plant Label:", selectedPlant);

        return [{ description: selectedPlant, confidence: 1 }];
    } catch (error) {
        console.error("❌ Google Vision API Error:", error);
        throw new Error("Failed to analyze image.");
    }
};




