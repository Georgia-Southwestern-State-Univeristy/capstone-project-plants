import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../functions/services/visionService.js';
import { fetchPlantFromPerenual, analyzePlantHealth } from '../functions/services/perenualService.js';
import { generateGeminiResponseWithImage } from '../functions/services/geminiService.js';
import { verifyFirebaseToken } from '../config/firebaseAdmin.js'; // ✅ Ensure correct import
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { uploadImageToStorage } from "../config/storage.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const db = getFirestore();
const storage = getStorage();

router.post("/chat", upload.single("image"), async (req, res) => {
    try {
        const { message, idToken } = req.body;

        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized: No ID token provided." });
        }

        const user = await verifyFirebaseToken(idToken);
        const userId = user.uid;

        let userMessage = message || "";
        let plantName = "Unknown Plant";
        let imageUrl = null;
        let aiResponse = null;

        if (req.file) {
            console.log("📸 Uploading plant image...");
            imageUrl = await uploadImageToStorage(req.file.buffer, req.file.mimetype, userId);

            // ✅ Directly send image buffer to Gemini Vision
            const base64Image = req.file.buffer.toString('base64');
            aiResponse = await generateGeminiResponseWithImage(base64Image);

            plantName = aiResponse.plantName || "Unknown Plant";

            userMessage += ` Here's an image of my plant. Can you tell me what it is?`;
        } else {
            return res.status(400).json({ error: "No image uploaded." });
        }

        // ✅ Save full chat entry to Firestore
        const chatRef = db.collection("users").doc(userId).collection("chats").doc();
        await chatRef.set({
            userMessage,
            aiResponse,
            plantName,
            imageUrl,
            createdAt: new Date().toISOString(),
        });

        res.json({
            message: aiResponse,
            imageUrl,
            chatId: chatRef.id,
        });

    } catch (error) {
        console.error("❌ Chat Route Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to process chat.", details: error.message });
        }
    }
});

//  * Extracts key plant details from AI-generated text.

const extractPlantDetailsFromAI = (aiResponse) => {
    try {
        console.log("🔍 [Extract AI] Parsing AI Response:", aiResponse);

        return {
            plantName: aiResponse.plantName || "Unknown Plant",
            scientificName: aiResponse.scientificName || "Unknown",
            sunlight: aiResponse.sunlight || "Unknown",
            wateringSchedule: aiResponse.wateringSchedule || "Unknown",
            commonIssues: aiResponse.commonIssues || "No issues found."
        };
    } catch (error) {
        console.error("❌ [Extract AI] Error parsing AI response:", error);
        return {
            plantName: "Unknown Plant",
            scientificName: "Unknown",
            sunlight: "Unknown",
            wateringSchedule: "Unknown",
            commonIssues: "No issues found."
        };
    }
};

const summarizeField = (field, type) => {
    if (!field || typeof field !== "string") return "Unknown";
  
    const lower = field.toLowerCase();
  
    if (type === "watering") {
      if (lower.includes("every day")) return "Daily";
      if (lower.includes("once a week") || lower.includes("weekly")) return "Weekly";
      if (lower.includes("2-3 times") || lower.includes("few times")) return "2–3x/week";
      if (lower.includes("regularly")) return "Regularly (don’t overwater)";
      if (lower.includes("moderate")) return "Moderate";
      if (lower.includes("infrequent")) return "Infrequent";
    }
  
    if (type === "sunlight") {
      if (lower.includes("full sun")) return "Full sun";
      if (lower.includes("partial shade") || lower.includes("partial sun")) return "Partial sun";
      if (lower.includes("bright, indirect")) return "Bright indirect";
      if (lower.includes("low light")) return "Low light";
    }
  
    return field.split(".")[0]; // fallback: first sentence
  };
  
  router.post("/add-plant", upload.single("image"), async (req, res) => {
    try {
      let { aiResponse, idToken } = req.body;
  
      if (!idToken) {
        return res.status(401).json({ error: "Unauthorized: No ID token provided." });
      }
  
      const user = await verifyFirebaseToken(idToken);
      const userId = user.uid;
  
      let imageUrl = req.body.imageUrl || null;
      let plantData = {};
  
      // ✅ Handle AI-generated upload
      if (aiResponse) {
        if (typeof aiResponse === "string") {
          aiResponse = JSON.parse(aiResponse);
        }
  
        const {
          plantName,
          scientificName,
          sunlight,
          wateringSchedule,
          wateringFrequencyDays,
          commonIssues,
        } = extractPlantDetailsFromAI(aiResponse);
  
        plantData = {
          plantName,
          scientificName,
          sunlight_schedule: summarizeField(sunlight, "sunlight"),
          wateringSchedule: summarizeField(wateringSchedule, "watering"),
          wateringFrequencyDays: wateringFrequencyDays || 3,
          wateringInstructions: wateringSchedule,
          commonIssues,
        };
  
      } else {
        // ✅ Handle manual form upload
        plantData = {
          plantName: req.body.plantName,
          scientificName: req.body.scientificName,
          sunlight_schedule: req.body.sunlight,
          wateringSchedule: req.body.wateringSchedule,
          wateringFrequencyDays: parseInt(req.body.wateringFrequencyDays) || 3,
          commonIssues: req.body.notes || "",
          lastWatered: req.body.lastWatered || new Date().toISOString(),
          health_status: req.body.health_status || "Healthy",
        };
      }
  
      // ✅ Handle image upload
      if (!imageUrl && req.file) {
        console.log("📸 Uploading plant image...");
        imageUrl = await uploadImageToStorage(req.file.buffer, req.file.mimetype, userId);
      }
  
      // ✅ Save plant to Firestore
      const userPlantRef = db.collection("users").doc(userId).collection("userPlants").doc();
      await userPlantRef.set({
        ...plantData,
        imageUrl,
        addedAt: new Date().toISOString(),
      });
  
      console.log(`✅ [Firestore] Plant saved for ${userId}: ${plantData.plantName}`);
  
      res.json({
        success: true,
        message: "Plant added successfully!",
        plantName: plantData.plantName,
        imageUrl,
        ...plantData,
      });
  
    } catch (error) {
      console.error("❌ [Add Plant Route] Error:", error);
      res.status(500).json({
        error: "Failed to add plant.",
        details: error.message,
      });
    }
  });
  


router.get("/get-last-chat", async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        console.log(`🔍 Fetching last chat for userId: ${userId}`);

        const chatSnapshot = await db.collection("users")
            .doc(userId)
            .collection("chats")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (chatSnapshot.empty) {
            console.log("⚠️ No chat found.");
            return res.json({ aiResponse: null });
        }

        const lastChat = chatSnapshot.docs[0].data();
        console.log("✅ Last chat found:", lastChat);

        res.json({ aiResponse: lastChat.aiResponse });

    } catch (error) {
        console.error("❌ Failed to fetch last AI response:", error);
        res.status(500).json({ error: "Failed to fetch AI response.", details: error.message });
    }
});


export default router;