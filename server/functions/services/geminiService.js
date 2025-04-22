import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateGeminiResponseWithImage(base64Image) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
  const prompt = `
You are a helpful plant care assistant. Analyze the plant in this photo and return detailed care instructions in **strict JSON format**.

Please include the following fields:
- "plantName": string
- "scientificName": string
- "sunlight": string
"wateringSchedule": string (e.g. "Every 5 days"). DO NOT return a range like "Every 4-5 days" — round to the most typical number of days.
- "wateringFrequencyDays": number (e.g. 5)
- "wateringInstructions": string (concise tip, e.g. "Keep soil moist, avoid overwatering.")
- "soilType": string
- "growthHabit": string
- "commonUses": string
- "commonIssues": string
- "funFact": string

Only return the JSON object. No explanation or markdown.
`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    let rawText = response.text();

    // Remove code block markers if present (e.g. ```json)
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    // Handle plain text fallback (not JSON)
    if (!cleaned.startsWith("{")) {
      console.error("❌ Gemini response was not in JSON format:", cleaned);
      return getFallback();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON parsing error:", cleaned);
      return getFallback();
    }

    // ✅ Sanitize numeric fields
    if (isNaN(parsed.wateringFrequencyDays)) {
      parsed.wateringFrequencyDays = 3; // fallback default
    }

    return parsed;
  } catch (error) {
    console.error("❌ Gemini API failed:", error);
    return getFallback();
  }
}

// Fallback plant object
function getFallback() {
  return {
    plantName: "Unknown Plant",
    scientificName: "",
    sunlight: "Moderate light",
    wateringSchedule: "Every 3 days",
    wateringFrequencyDays: 3,
    wateringInstructions: "Keep soil slightly moist.",
    soilType: "Well-draining soil",
    growthHabit: "",
    commonUses: "",
    commonIssues: "",
    funFact: "This is a default fallback plant profile.",
  };
}
