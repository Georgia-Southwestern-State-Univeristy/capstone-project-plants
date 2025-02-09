import express from 'express';
import { fetchPlantFromPerenual } from '../services/perenualService.js';
import { storePlant } from '../utils/firebaseAdmin.js'; // Assuming you have Firebase set up

const router = express.Router();

/**
 * GET /plants/:plantId - Fetch plant data from Perenual API and store in Firestore
 */
router.get('/plants/:plantId', async (req, res) => {
    const { plantId } = req.params;

    try {
        const plant = await fetchPlantFromPerenual(plantId);

        if (!plant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        // Store plant in Firestore (Firebase)
        await storePlant(plant);

        res.json(plant);
    } catch (error) {
        console.error('Error retrieving plant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
