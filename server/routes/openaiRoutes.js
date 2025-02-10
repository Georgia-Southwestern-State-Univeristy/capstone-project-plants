import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ AI Chat for Plant Care
router.post('/chat', async (req, res) => {
    try {
        const { plantInfo } = req.body;
        if (!plantInfo) return res.status(400).json({ error: 'No plant information provided' });

        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are Verdure AI, an expert plant care assistant." },
                { role: "user", content: plantInfo }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        res.json({ advice: response.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get plant care advice', details: error.message });
    }
});

export default router;
