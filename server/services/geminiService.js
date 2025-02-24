import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export const generateGeminiResponse = async (plantInfo) => {
    try {
        console.log("🔍 [Gemini Service] Sending request to Gemini API...");
        console.log("🔹 Plant Information:", plantInfo);

        const response = await axios.post(GEMINI_API_URL, {
            contents: [
                { 
                    parts: [{ text: `You are an expert botanist. Provide detailed plant identification and care information in a structured format using bold headers. Here is the plant information: ${plantInfo}` }] 
                }
            ]
        });

        console.log("✅ [Gemini Service] Raw API Response:", response.data);

        let aiResponse = response.data.candidates?.[0]?.content || "I am unsure about this plant.";

        // ✅ Ensure aiResponse is a string
        if (!aiResponse || typeof aiResponse !== "string") {
            aiResponse = JSON.stringify(aiResponse);
        }

        // ✅ Format Response for Readability
        aiResponse = aiResponse
            .replace(/\n{2,}/g, "<br><br>")  // ✅ Convert multiple newlines to proper spacing
            .replace(/\n/g, "<br>")  // ✅ Convert single newlines into <br> for Vue rendering
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // ✅ Convert Markdown-style **bold** into HTML <b> tags
            .replace(/\*/g, "•");  // ✅ Convert bullet points into readable symbols

        console.log("✅ [Gemini Service] Cleaned AI Response:", aiResponse);

        return aiResponse;
    } catch (error) {
        console.error("❌ [Gemini Service] Error:", error.response?.data || error.message);
        throw new Error("Failed to generate AI response.");
    }
};




