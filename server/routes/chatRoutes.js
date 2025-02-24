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

        let userMessage = req.body.message || "";
        let plantLabels = [];
        let plantName = "Unknown Plant";

        // ✅ If an image is uploaded, analyze it with Google Vision
        if (req.file) {
            console.log("📸 [Chat Route] Processing uploaded image...");
            plantLabels = await analyzeImage(req.file.buffer);

            if (plantLabels.length > 0) {
                plantName = plantLabels[0].description; // ✅ Use most confident plant label
                userMessage += ` My plant looks like: ${plantName}.`;
            }
        }

        console.log("✅ [Chat Route] Plant Identified:", plantName);

        // ✅ Fetch plant details from Perenual API
        const plantData = await fetchPlantFromPerenual(plantName);

        // ✅ Improve AI Response by Structuring a Better Prompt
        let fullMessage = `I uploaded an image of a plant that looks like a ${plantName}.`;
        if (plantData) {
            fullMessage += ` This plant is likely a ${plantData.common_name} (${plantData.scientific_name}). It requires ${plantData.sunlight} sunlight and ${plantData.watering} watering.`;
        } else {
            fullMessage += " I am unsure about the exact plant name.";
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