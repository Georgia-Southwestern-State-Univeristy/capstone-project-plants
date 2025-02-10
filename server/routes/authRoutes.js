import express from 'express';
import { registerWithEmail, loginWithEmail, resetPassword } from '../services/authService.js';

const router = express.Router();

// ✅ Register User
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

        const user = await registerWithEmail(email, password, name);
        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ✅ Login User
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Missing email' });

        const user = await loginWithEmail(email);
        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ✅ Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Missing email' });

        const response = await resetPassword(email);
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
