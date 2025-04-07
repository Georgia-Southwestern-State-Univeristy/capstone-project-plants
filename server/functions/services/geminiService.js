import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-pro-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;


export const generateGeminiResponseWithImage = async (imageBuffer) => {
    try {
        console.log("🧠 [Gemini] Sending image to Gemini...");

        const base64Image = imageBuffer.toString('base64');

        const response = await axios.post(GEMINI_API_URL, {
            contents: [
                {
                    parts: [
                        { text: `
                            You are a helpful plant expert. Analyze the plant in this photo.
                            Provide the most likely plant name, care instructions, and a fun fact.
                            Return the result as a JSON object like this:

                            {
                              "plantName": "...",
                              "scientificName": "...",
                              "sunlight": "...",
                              "wateringSchedule": "...",
                              "soilType": "...",
                              "growthHabit": "...",
                              "commonUses": "...",
                              "commonIssues": "...",
                              "funFact": "..."
                            }
                        ` },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }
            ]
        });

        const aiTextResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = aiTextResponse.replace(/```json\n?|\n?```/g, "").trim();

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("❌ [Gemini Image] Error:", error.response?.data || error.message);
        return {
            plantName: "Unknown",
            scientificName: "Unknown",
            sunlight: "Unknown",
            wateringSchedule: "Unknown",
            soilType: "Unknown",
            growthHabit: "Unknown",
            commonUses: "Unknown",
            commonIssues: "Unknown",
            funFact: "Unknown"
        };
    }
};






