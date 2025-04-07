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
                        Hey! You're a friendly, knowledgeable plant expert helping someone learn more about their plant. 
                        Please provide a helpful and engaging response in **a casual tone**, while also being **informative**. 

                        Include details about the plant's name, care needs, and any interesting facts. Try to **keep it light and conversational** 
                        while still giving useful plant care tips.

                        Format the response as a **JSON object** so it can be displayed easily. Here’s the structure:

                        {
                          "plantName": "Common plant name (e.g., Spider Plant)",
                          "scientificName": "Scientific name (e.g., Chlorophytum comosum)",
                          "sunlight": "Sunlight needs (e.g., Bright, indirect light)",
                          "wateringSchedule": "How often to water (e.g., Every 7-10 days)",
                          "soilType": "Best soil type (e.g., Well-draining potting mix)",
                          "growthHabit": "How the plant grows (e.g., Trailing vine, upright shrub)",
                          "commonUses": "How people use it (e.g., Indoor air purification, medicinal, culinary)",
                          "commonIssues": "Common problems (e.g., Overwatering can cause root rot)",
                          "funFact": "A fun fact about the plant (e.g., 'Spider Plants are great at removing toxins from the air!')"
                        }

                        Here is the plant information: ${plantInfo}
                    `}] 
                }
            ]
        });

        console.log("✅ [Gemini Service] Raw API Response:", JSON.stringify(response.data, null, 2));

        let aiTextResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiTextResponse) {
            console.error("❌ [Gemini Service] AI Response is not valid.");
            return "I couldn't generate a response.";
        }

        // ✅ REMOVE Markdown-style code blocks (```json ... ```)
        aiTextResponse = aiTextResponse.replace(/```json\n?|\n?```/g, "").trim();

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
                soilType: "Unknown",
                growthHabit: "Unknown",
                commonUses: "Unknown",
                commonIssues: "No issues found.",
                funFact: "No fun fact available."
            };
        }
    } catch (error) {
        console.error("❌ [Gemini Service] Error:", error.response?.data || error.message);
        throw new Error("Failed to generate AI response.");
    }
};

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






