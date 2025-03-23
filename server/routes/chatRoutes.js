import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../services/visionService.js';
import { fetchPlantFromPerenual, analyzePlantHealth } from '../services/perenualService.js';
import { generateGeminiResponse } from '../services/geminiService.js';
import { verifyFirebaseToken } from '../utils/firebaseAdmin.js'; // ✅ Ensure correct import
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const db = getFirestore();
const storage = getStorage();


router.post("/chat", upload.single("image"), async (req, res) => {
    try {
        console.log("🔍 Incoming Chat Request:", req.body, req.file);

        const { message, idToken } = req.body; // ✅ Add this

        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized: No ID token provided." });
        }

        const user = await verifyFirebaseToken(idToken);
        const userId = user.uid;

        console.log("✅ User authenticated:", userId);
        let userMessage = message || "";

        let plantLabels = [];
        let plantName = "Unknown Plant";
        let imageUrl = null;

        if (req.file) {
            console.log("📸 Processing uploaded image...");
            const bucket = storage.bucket();
            const fileName = `users/${userId}/uploads/${Date.now()}_plant.jpg`;
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, { contentType: req.file.mimetype });
            
            // Generate a signed URL instead of making public
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2030',
            });

            imageUrl = url;
            console.log("✅ Image uploaded:", imageUrl);

            // Analyze image for plant identification
            plantLabels = await analyzeImage(req.file.buffer);
            if (plantLabels.length > 0) {
                plantName = plantLabels[0].description;
                userMessage += ` My plant looks like: ${plantName}.`;
            }
        }

        console.log("✅ Identified Plant Name:", plantName);
        let plantData = await fetchPlantFromPerenual(plantName);
        if (!plantData) {
            console.log("⚠️ No plant data found, using default.");
            plantData = { common_name: plantName, scientific_name: ["Unknown"] };
        }

        let fullMessage = `I uploaded an image of a plant that looks like a ${plantName}.`;
        if (plantData) {
            fullMessage += ` This plant is likely a ${plantData.common_name} (${plantData.scientific_name}). It requires ${plantData.sunlight || "unknown"} sunlight and ${plantData.watering || "unknown"} watering.`;
        }

        console.log("✅ Sending AI Prompt:", fullMessage);
        const aiResponse = await generateGeminiResponse(fullMessage);

        // const chatRef = db.collection("users").doc(userId).collection("chats").doc();
        // await chatRef.set({
        //     userMessage,
        //     aiResponse,
        //     plantName,
        //     imageUrl,
        //     createdAt: new Date().toISOString(),
        // });

        res.json({ 
            message: aiResponse || "I couldn't find any information on this plant.", 
            // chatId: chatRef.id, 
            imageUrl 
          });
          

    } catch (error) {
        console.error("❌ Chat Route Error:", error);
        res.status(500).json({ error: "Failed to process chat.", details: error.message });
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

        // ✅ Parse stringified JSON from FormData
        if (typeof aiResponse === "string") {
            aiResponse = JSON.parse(aiResponse);
        }

        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized: No ID token provided." });
        }

        // ✅ Authenticate user
        const user = await verifyFirebaseToken(idToken);
        const userId = user.uid;

        let imageUrl = null;

        // ✅ Extract simplified plant data
        const {
            plantName,
            scientificName,
            sunlight,
            wateringSchedule,
            commonIssues
        } = extractPlantDetailsFromAI(aiResponse);
        
        // ✅ Summarize for card layout
        const summarySunlight = summarizeField(sunlight, "sunlight");
        const summaryWatering = summarizeField(wateringSchedule, "watering");
        

        // ✅ Upload image if provided
        if (req.file) {
            console.log("📸 Uploading plant image...");
            const bucket = storage.bucket();
            const fileName = `users/${userId}/uploads/${Date.now()}_plant.jpg`;
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, { contentType: req.file.mimetype });

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2030',
            });

            imageUrl = url;
        }

        // ✅ Save plant card in `userPlants`
        const userPlantRef = db.collection("users").doc(userId).collection("userPlants").doc();
        await userPlantRef.set({
            plantName,
            scientificName,
            sunlight: summarySunlight,
            wateringSchedule: summaryWatering,
            commonIssues,
            imageUrl,
            addedAt: new Date().toISOString(),
        });

        console.log(`✅ [Firestore] Saved plant card for ${userId}: ${plantName}`);

        // ✅ Save full chat to `chats`
        const chatRef = db.collection("users").doc(userId).collection("chats").doc();
        await chatRef.set({
            userMessage: `Identified plant: ${plantName}`,
            aiResponse,
            plantName,
            imageUrl,
            createdAt: new Date().toISOString(),
        });

        console.log(`💬 [Firestore] Saved chat log for ${userId}: ${chatRef.id}`);

        res.json({
            success: true,
            message: "Plant added successfully!",
            plantName,
            imageUrl,
            sunlight,
            wateringSchedule,
            commonIssues,
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