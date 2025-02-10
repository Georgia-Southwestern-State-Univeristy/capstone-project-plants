import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();
const db = getFirestore();

// ✅ Get User Profile
router.get('/profile/:userId', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return res.status(404).json({ error: 'User profile not found' });

        res.json(userDoc.data());
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

export default router;
