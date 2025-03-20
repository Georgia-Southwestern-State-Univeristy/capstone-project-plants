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
                    parts: [{ text: `
                        You are an expert botanist. Based on the following plant information, return a structured JSON object with the following keys:
                        - plantName: The common name of the plant.
                        - scientificName: The scientific name.
                        - sunlight: The ideal sunlight conditions.
                        - wateringSchedule: Recommended watering frequency.
                        - commonIssues: Common problems and how to prevent them.

                        Return only valid JSON and no extra text.
                        Here is the plant information: ${plantInfo}
                    `}] 
                }
            ]
        });

        console.log("✅ [Gemini Service] Raw API Response:", JSON.stringify(response.data, null, 2));

        // ✅ Extract AI response safely and parse JSON
        let aiTextResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiTextResponse) {
            console.error("❌ [Gemini Service] AI Response is not valid.");
            return "I couldn't generate a response.";
        }

        try {
            const aiJson = JSON.parse(aiTextResponse);
            console.log("✅ [Gemini Service] Parsed AI Response:", aiJson);
            return aiJson;
        } catch (error) {
            console.error("❌ [Gemini Service] Failed to parse AI response as JSON.");
            return {
                plantName: "Unknown",
                scientificName: "Unknown",
                sunlight: "Unknown",
                wateringSchedule: "Unknown",
                commonIssues: "No issues found."
            };
        }
    } catch (error) {
        console.error("❌ [Gemini Service] Error:", error.response?.data || error.message);
        throw new Error("Failed to generate AI response.");
    }
};







