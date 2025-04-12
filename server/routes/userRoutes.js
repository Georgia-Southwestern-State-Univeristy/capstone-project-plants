import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import multer from 'multer';

const storage = getStorage();
const router = express.Router();
const db = getFirestore();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Get User Profile (Now Includes Plants)
router.get('/profile/:userId', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return res.status(404).json({ error: 'User profile not found' });

        // Fetch user plants
        const plantsSnapshot = await userRef.collection('plants').get();
        const plants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({ ...userDoc.data(), plants });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Add a New Plant to User Profile
router.post('/profile/:userId/plants', async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, type, wateringSchedule, lastWatered, healthStatus } = req.body;
        
        if (!name || !type || !wateringSchedule || !lastWatered) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const plantRef = db.collection('users').doc(userId).collection('plants').doc();
        await plantRef.set({
            name,
            type,
            wateringSchedule,
            lastWatered,
            healthStatus: healthStatus || 'Healthy',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ success: true, id: plantRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get Chat History
router.get('/chat-history/:userId', async (req, res) => {
    try {
        const messages = [];
        const messageRefs = await db.collection(`chats/${req.params.userId}/messages`)
            .orderBy('timestamp')
            .get();

        messageRefs.forEach((msg) => messages.push(msg.data()));

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Save Chat Message
router.post('/message', async (req, res) => {
    try {
        const { userId, message } = req.body;
        if (!userId || !message) return res.status(400).json({ error: 'Missing required fields' });

        await db.collection(`chats/${userId}/messages`).add({
            ...message,
            timestamp: new Date()
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/profile/:userId/avatar', upload.single('avatar'), async (req, res) => {
    console.log("✅ Hit /profile/:userId/avatar route");

    try {
      const file = req.file;
      const { userId } = req.params;
  
      if (!file) return res.status(400).json({ error: 'No file uploaded' });
  
      const bucket = storage.bucket();
      const fileName = `avatars/${userId}/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);
  
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
  
      stream.on('error', (err) => {
        return res.status(500).json({ error: err.message });
      });
  
      stream.on('finish', async () => {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
        await db.collection('users').doc(userId).update({
          profileImage: publicUrl,
          updatedAt: new Date().toISOString()
        });
  
        res.status(200).json({ success: true, imageUrl: publicUrl });
      });
  
      stream.end(file.buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export default router;
