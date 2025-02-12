// import express from 'express';
// import multer from 'multer';
// import { analyzeImage } from '../services/visionService.js';

// const router = express.Router();

// // ✅ Ensure file uploads are handled in memory (not stored on disk)
// const upload = multer({ storage: multer.memoryStorage() });

// router.post('/analyze', upload.single('image'), async (req, res) => {
//     try {
//         if (!req.file || !req.file.buffer) {
//             return res.status(400).json({ error: 'No image uploaded' });
//         }

//         console.log("✅ Image received for processing:", req.file.mimetype);

//         // ✅ Pass the file buffer to Google Vision API
//         const labels = await analyzeImage(req.file.buffer);
//         res.json({ labels });
//     } catch (error) {
//         console.error("❌ Vision API Error:", error);
//         res.status(500).json({ error: "Image analysis failed", details: error.message });
//     }
// });

// export default router;

import express from 'express';
import multer from 'multer';
import { analyzeImage } from '../services/visionService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }).single('image');


// ✅ Analyze Image Route
// router.post('/analyze', upload.single('image'), async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

//         const labels = await analyzeImage(req.file.buffer);
//         res.json({ labels });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
router.post('/analyze', (req, res, next) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error("❌ Multer Error:", err.message);
            return res.status(400).json({ error: `Multer Error: ${err.message}` });
        } else if (err) {
            console.error("❌ Unknown Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!req.file) return res.status(400).json({ error: "No image uploaded" });

        try {
            const labels = await analyzeImage(req.file.buffer);
            res.json({ labels });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});


export default router;