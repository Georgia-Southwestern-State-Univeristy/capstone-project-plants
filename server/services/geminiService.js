import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`;

/**
 * Generate a natural language response from Gemini AI
 * @param {string} userInput - User's message
 * @returns {Promise<string>} - AI-generated response
 */
export const generateGeminiResponse = async (userInput) => {
    try {
        const response = await axios.post(GEMINI_API_URL, {
            model: "gemini-pro", // ✅ Correct model name
            prompt: { text: userInput },
            temperature: 0.7,
            maxOutputTokens: 500
        });

        return response.data.candidates[0].output;
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        throw new Error("Failed to generate AI response.");
    }
};
