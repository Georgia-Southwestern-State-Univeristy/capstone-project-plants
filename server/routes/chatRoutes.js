import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../services/visionService.js';
import { fetchPlantFromPerenual, analyzePlantHealth } from '../services/perenualService.js';
import { generateGeminiResponse } from '../services/geminiService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Unified Chat Route (Handles Text & Images)
router.post('/chat', upload.single('image'), async (req, res) => {
    try {
        let userMessage = req.body.message || "";
        let plantLabels = [];

        // 🔹 If an image is uploaded, analyze it with Google Vision
        if (req.file) {
            plantLabels = await analyzeImage(req.file.buffer);
            if (plantLabels.length > 0) {
                userMessage += ` My plant looks like: ${plantLabels.map(label => label.description).join(", ")}.`;
            }
        }

        // 🔹 Fetch plant details from Perenual API
        const plantData = plantLabels.length ? await fetchPlantFromPerenual(plantLabels[0].description) : null;

        // 🔹 Analyze plant health
        const plantHealth = plantLabels.length ? analyzePlantHealth(plantLabels) : { isHealthy: true, details: "No image provided." };

        // 🔹 Construct AI message
        let fullMessage = userMessage;
        if (plantData) {
            fullMessage += ` This plant is likely a ${plantData.common_name} (${plantData.scientific_name}).`;
        }
        fullMessage += ` Health Status: ${plantHealth.details}`;

        // 🔹 Get AI response from Gemini
        const aiResponse = await generateGeminiResponse(fullMessage);

        res.json({ message: aiResponse });

    } catch (error) {
        console.error("❌ Chat API Error:", error);
        res.status(500).json({ error: "Failed to process chat.", details: error.message });
    }
});

export default router;
