import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export const generateGeminiResponse = async (userInput) => {
    try {
        console.log("🔍 [Gemini Service] Sending request to Gemini API...");
        console.log("🔹 User Input:", userInput);
        console.log("🔹 Using API Key:", GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");
        console.log("🔹 API URL:", GEMINI_API_URL);

        // ✅ Correct Gemini API Request Format
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{ parts: [{ text: userInput }] }] // ✅ Correct request body
        });

        console.log("✅ [Gemini Service] API Response:", response.data);

        return response.data.candidates?.[0]?.content || "I'm not sure how to respond.";
    } catch (error) {
        console.error("❌ [Gemini Service] Error:", error.response?.data || error.message);
        throw new Error("Failed to generate AI response.");
    }
};
