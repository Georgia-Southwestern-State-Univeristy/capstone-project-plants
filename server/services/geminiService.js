import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-pro-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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

        console.log("✅ [Gemini Service] Raw API Response:", JSON.stringify(response.data, null, 2));

        // ✅ Extract AI response safely from `parts` array
        let aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse || typeof aiResponse !== "string") {
            console.error("❌ [Gemini Service] AI Response is not a valid text string.");
            aiResponse = "I couldn't generate a response.";
        }

        // ✅ Format AI Response for Readability
        aiResponse = aiResponse
            .replace(/\n{2,}/g, "<br><br>")  // ✅ Convert multiple newlines to <br><br> for spacing
            .replace(/\n/g, "<br>")  // ✅ Convert single newlines to <br> for Vue rendering
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // ✅ Convert **bold** Markdown to HTML <b> tags
            .replace(/\*/g, "•");  // ✅ Convert bullet points to readable symbols

        console.log("✅ [Gemini Service] Cleaned AI Response:", aiResponse);

        return aiResponse;
    } catch (error) {
        console.error("❌ [Gemini Service] Error:", error.response?.data || error.message);
        throw new Error("Failed to generate AI response.");
    }
};






