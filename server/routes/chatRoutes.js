import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../services/visionService.js';
import { fetchPlantFromPerenual, analyzePlantHealth } from '../services/perenualService.js';
import { generateGeminiResponse } from '../services/geminiService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/chat", upload.single("image"), async (req, res) => {
    try {
        console.log("🔍 Incoming Request:", req.body, req.file);

        const { message, idToken } = req.body;
        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized: No ID token provided." });
        }

        // ✅ Verify the user's Firebase authentication
        const user = await verifyFirebaseToken(idToken);
        const userId = user.uid;

        let userMessage = message || "";
        let plantLabels = [];
        let plantName = "Unknown Plant";

        // ✅ If an image is uploaded, analyze it with Google Vision
        if (req.file) {
            console.log("📸 [Chat Route] Processing uploaded image...");
            plantLabels = await analyzeImage(req.file.buffer);

            if (plantLabels.length > 0) {
                plantName = plantLabels[0].description;
                console.log("✅ [Chat Route] Most Specific Plant Identified:", plantName);
                userMessage += ` My plant looks like: ${plantName}.`;
            }
        }

        console.log("✅ [Chat Route] Plant Identified:", plantName);

        // ✅ Fetch plant details from Perenual API
        let plantData = await fetchPlantFromPerenual(plantName);

        // ✅ If no plant data is found, store a generic entry
        if (!plantData) {
            console.log(`⚠️ [Chat Route] No plant data found for: ${plantName}, storing basic info.`);
            plantData = {
                common_name: plantName,
                scientific_name: ["Unknown"],
            };
        }

        // ✅ Store the identified plant in Firestore under the user's collection
        const userPlantRef = db.collection("users").doc(userId).collection("userPlants").doc();
        await userPlantRef.set({
            plantName: plantData.common_name,
            scientificName: plantData.scientific_name[0] || "Unknown",
            addedAt: new Date().toISOString(),
        });

        console.log(`✅ [Firestore] Stored plant for user ${userId}: ${plantData.common_name}`);

        // ✅ Improve AI Prompt
        let fullMessage = `I uploaded an image of a plant that looks like a ${plantName}.`;
        if (plantData) {
            fullMessage += ` This plant is likely a ${plantData.common_name} (${plantData.scientific_name}). It requires ${plantData.sunlight || "unknown"} sunlight and ${plantData.watering || "unknown"} watering.`;
        }

        console.log("✅ [Chat Route] Sending AI Prompt:", fullMessage);

        // ✅ Get AI response from Gemini
        const aiResponse = await generateGeminiResponse(fullMessage);

        console.log("✅ [Chat Route] AI Response:", aiResponse);
        res.json({ message: aiResponse });

    } catch (error) {
        console.error("❌ [Chat Route] Error:", error);
        res.status(500).json({ error: "Failed to process chat.", details: error.message });
    }
});



export default router;