import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../services/visionService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store images in memory

// ✅ Analyze Image Route
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const labels = await analyzeImage(req.file.buffer);
        res.json({ labels });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Upload Image to Firebase Storage Route (Optional)
// router.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

//         const imageUrl = await uploadToStorage(req.file.buffer, req.file.originalname);
//         res.json({ imageUrl });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

export default router;
