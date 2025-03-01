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
        console.log("🔍 Incoming Request:", req.body, req.file);

        const { message, idToken } = req.body;
        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized: No ID token provided." });
        }

        // ✅ Verify the user's Firebase authentication
        const user = await verifyFirebaseToken(idToken);
        const userId = user.uid;

        console.log("✅ User authenticated:", userId);

        let userMessage = message || "";
        let plantLabels = [];
        let plantName = "Unknown Plant";

        // ✅ If an image is uploaded, analyze it with Google Vision
        if (req.file) {
            console.log("📸 [Chat Route] Processing uploaded image...");
            plantLabels = await analyzeImage(req.file.buffer);

            if (plantLabels.length > 0) {
                plantName = plantLabels[0].description;
                console.log("✅ [Chat Route] Most Specific Plant Identified:", plantName);
                userMessage += ` My plant looks like: ${plantName}.`;
            }
        }

        console.log("✅ [Chat Route] Plant Identified:", plantName);

        // ✅ Fetch plant details from Perenual API
        let plantData = await fetchPlantFromPerenual(plantName);

        // ✅ If no plant data is found, store a generic entry
        if (!plantData) {
            console.log(`⚠️ [Chat Route] No plant data found for: ${plantName}, storing basic info.`);
            plantData = {
                common_name: plantName,
                scientific_name: ["Unknown"],
            };
        }

        // ✅ Improve AI Prompt
        let fullMessage = `I uploaded an image of a plant that looks like a ${plantName}.`;
        if (plantData) {
            fullMessage += ` This plant is likely a ${plantData.common_name} (${plantData.scientific_name}). It requires ${plantData.sunlight || "unknown"} sunlight and ${plantData.watering || "unknown"} watering.`;
        }

        console.log("✅ [Chat Route] Sending AI Prompt:", fullMessage);

        // ✅ Get AI response from Gemini
        const aiResponse = await generateGeminiResponse(fullMessage);

        console.log("✅ [Chat Route] AI Response:", aiResponse);
        res.json({ message: aiResponse });

    } catch (error) {
        console.error("❌ [Chat Route] Error:", error);
        res.status(500).json({ error: "Failed to process chat.", details: error.message });
    }
});
router.post("/add-plant", upload.single("image"), async (req, res) => {
    try {
        const { plantName, scientificName, wateringSchedule, idToken } = req.body;

        if (!idToken) {
            return res.status(401).json({ error: "Unauthorized: No ID token provided." });
        }

        // Verify the user's Firebase authentication
        const user = await verifyFirebaseToken(idToken);
        const userId = user.uid;

        let imageUrl = null;
        let finalPlantName = plantName && plantName.trim() !== "" ? plantName : "Unknown Plant";
        let finalWateringSchedule = wateringSchedule && wateringSchedule.trim() !== "" ? wateringSchedule : "7 days";
        
        // If an image is uploaded, upload it to Firebase Storage
        if (req.file) {
            const bucket = storage.bucket();
            const fileName = `users/${userId}/plants/${Date.now()}_${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, { contentType: req.file.mimetype });
            await file.makePublic(); // Ensure the file is publicly accessible
            imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        }

        // Save the plant data in Firestore
        const userPlantRef = db.collection("users").doc(userId).collection("userPlants").doc();
        await userPlantRef.set({
            plantName: finalPlantName,
            scientificName: scientificName || "Unknown",
            wateringSchedule: finalWateringSchedule,
            imageUrl,
            addedAt: new Date().toISOString(),
        });

        console.log(`✅ [Firestore] Stored plant for user ${userId}: ${finalPlantName}`);

        res.json({ success: true, message: "Plant added successfully!", imageUrl });
    } catch (error) {
        console.error("❌ [Add Plant Route] Error:", error);
        res.status(500).json({ error: "Failed to add plant.", details: error.message });
    }
});

export default router;
