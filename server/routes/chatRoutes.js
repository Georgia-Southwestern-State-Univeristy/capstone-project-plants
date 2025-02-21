import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../services/visionService.js';
import OpenAI from 'openai';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const client = new OpenAI({ apiKey: process.env.VITE_APP_OPENAI_API_KEY });

// ✅ Unified Chat Route (Handles Text & Images)
router.post('/chat', upload.single('image'), async (req, res) => {
    try {
        let userMessage = req.body.message || "";
        let imageLabels = [];

        // 🔹 If an image is uploaded, analyze it with Google Vision
        if (req.file) {
            imageLabels = await analyzeImage(req.file.buffer);
            if (imageLabels.length > 0) {
                userMessage += ` My plant looks like: ${imageLabels.map(label => label.description).join(", ")}.`;
            }
        }

        // 🔹 If there’s no text message & no image labels, return an error
        if (!userMessage.trim()) {
            return res.status(400).json({ error: "No valid input provided." });
        }

        // 🔹 Call OpenAI to generate a response
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are Verdure AI, an expert plant care assistant." },
                { role: "user", content: userMessage }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        res.json({ message: response.choices[0].message.content });

    } catch (error) {
        console.error("❌ Chat API Error:", error);
        res.status(500).json({ error: "Failed to process chat.", details: error.message });
    }
});

export default router;
