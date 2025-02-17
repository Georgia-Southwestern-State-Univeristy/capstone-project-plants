import express from 'express';
import { fetchPlantFromPerenual } from '../services/perenualService.js';
import { db } from '../utils/firebaseAdmin.js';

const router = express.Router();

/**
 * GET /users/:userId/plants - Retrieve all plants saved by a user
 */
router.get('/users/:userId/plants', async (req, res) => {
    const { userId } = req.params;
    try {
        const plantsSnapshot = await db.collection('users').doc(userId).collection('plants').get();
        const plants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(plants);
    } catch (error) {
        console.error('Error fetching user plants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /users/:userId/plants/:plantId - Fetch plant from Perenual API and store in Firestore
 */
router.get('/users/:userId/plants/:plantId', async (req, res) => {
    const { userId, plantId } = req.params;
    try {
        const plant = await fetchPlantFromPerenual(plantId);
        if (!plant) return res.status(404).json({ error: 'Plant not found' });
        
        const plantRef = db.collection('users').doc(userId).collection('plants').doc(plantId);
        await plantRef.set(plant, { merge: true });
        
        res.json(plant);
    } catch (error) {
        console.error('Error retrieving plant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /users/:userId/plants - Add a new plant manually
 */
router.post('/users/:userId/plants', async (req, res) => {
    const { userId } = req.params;
    const { name, type, wateringSchedule, lastWatered, healthStatus } = req.body;
    
    try {
        const newPlantRef = db.collection('users').doc(userId).collection('plants').doc();
        await newPlantRef.set({
            name,
            type,
            wateringSchedule,
            lastWatered,
            healthStatus: healthStatus || 'Healthy',
            createdAt: new Date().toISOString()
        });
        res.status(201).json({ success: true, id: newPlantRef.id });
    } catch (error) {
        console.error('Error adding plant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
