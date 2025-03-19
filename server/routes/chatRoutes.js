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
        const { message, idToken } = req.body;

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

        const chatRef = db.collection("users").doc(userId).collection("chats").doc();
        await chatRef.set({
            userMessage,
            aiResponse,
            plantName,
            imageUrl,
            createdAt: new Date().toISOString(),
        });

        res.json({ message: aiResponse, chatId: chatRef.id, imageUrl });

    } catch (error) {
        console.error("❌ Chat Route Error:", error);
        res.status(500).json({ error: "Failed to process chat.", details: error.message });
    }
});






/**
 * Extracts key plant details from AI-generated text.
 */
const extractPlantDetailsFromAI = (aiResponse) => {
    console.log("🔍 [Extract AI] Raw AI Response:", aiResponse);

    let plantName = "Unknown Plant";
    let scientificName = "Unknown";
    let wateringSchedule = "7 days";

    if (aiResponse) {
        const nameMatch = aiResponse.match(/Plant Identification: (.*?) \(/);
        console.log("🔍 [Extract AI] Name Match:", nameMatch);

        if (nameMatch && nameMatch[1]) {
            plantName = nameMatch[1].trim();
        }

        const scientificMatch = aiResponse.match(/\((.*?)\)/);
        console.log("🔍 [Extract AI] Scientific Name Match:", scientificMatch);

        if (scientificMatch && scientificMatch[1]) {
            scientificName = scientificMatch[1].trim();
        }

        const wateringMatch = aiResponse.match(/Watering: (.*?)(\.|\n)/);
        console.log("🔍 [Extract AI] Watering Match:", wateringMatch);

        if (wateringMatch && wateringMatch[1]) {
            wateringSchedule = wateringMatch[1].trim();
        }
    }

    console.log("✅ [Extract AI] Parsed Data:", { plantName, scientificName, wateringSchedule });
    return { plantName, scientificName, wateringSchedule };
};


router.post("/add-plant", upload.single("image"), async (req, res) => {
    try {
        const { aiResponse, idToken } = req.body;

        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized: No ID token provided." });
        }

        const user = await verifyFirebaseToken(idToken);
        const userId = user.uid;

        let imageUrl = null;
        const { plantName, scientificName, wateringSchedule } = extractPlantDetailsFromAI(aiResponse);

        if (req.file) {
            console.log("📸 Storing plant image...");
            const bucket = storage.bucket();
            const fileName = `users/${userId}/uploads/${Date.now()}_plant.jpg`; // Consistent path
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, { contentType: req.file.mimetype });

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2030',
            });

            imageUrl = url;
        }

        const userPlantRef = db.collection("users").doc(userId).collection("userPlants").doc();
        await userPlantRef.set({
            plantName,
            scientificName,
            wateringSchedule,
            imageUrl, 
            addedAt: new Date().toISOString(),
        });

        console.log(`✅ [Firestore] Stored plant for user ${userId}: ${plantName}`);
        res.json({ success: true, message: "Plant added successfully!", imageUrl, plantName, wateringSchedule });

    } catch (error) {
        console.error("❌ [Add Plant Route] Error:", error);
        res.status(500).json({ error: "Failed to add plant.", details: error.message });
    }
});



router.get("/get-last-chat", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Fetch the last AI response
        const chatSnapshot = await db.collection("users")
            .doc(userId)
            .collection("chats")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (chatSnapshot.empty) {
            return res.json({ aiResponse: null });
        }

        const lastChat = chatSnapshot.docs[0].data();
        res.json({ aiResponse: lastChat.aiResponse });

    } catch (error) {
        console.error("❌ Failed to fetch last AI response:", error);
        res.status(500).json({ error: "Failed to fetch AI response." });
    }
});


export default router;