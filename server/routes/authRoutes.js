import express from 'express';

import { getAuth } from 'firebase-admin/auth'; // Fix for 'auth' is not defined
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'; // Fix missing imports
import { registerWithEmail, loginWithEmail, resetPassword } from '../functions/services/authService.js';
import { googleClient, db, verifyFirebaseToken } from '../config/firebaseAdmin.js'; // Ensure googleClient is defined in firebase.js


const router = express.Router();
const auth = getAuth(); // Firebase Admin SDK Auth Instance

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
        if (!email) return res.status(400).json({ error: 'Missing email' });v 

        const user = await loginWithEmail(email);
        res.json({ success: true, user });
        console.log('SUccess User:', user);
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

// ✅ Google Sign-In Route (Fixes missing imports & undefined variables)
router.post('/google-login', async (req, res) => {
    try {
      const { id_token } = req.body;
      if (!id_token) return res.status(400).json({ error: 'Missing ID token' });
  
      const decodedToken = await verifyFirebaseToken(id_token);
      const { uid, email, name, picture } = decodedToken;
  
      const userRef = db.collection('users').doc(uid);
      const docSnap = await userRef.get();
  
      if (!docSnap.exists) {
        await userRef.set({
          email,
          name,
          picture,
          createdAt: new Date().toISOString()
        });
      }
  
      res.status(200).json({
        success: true,
        user: { uid, email, name, picture }
      });
  
    } catch (error) {
      console.error('❌ Google Login Failed:', error);
      res.status(401).json({ error: 'Authentication failed', details: error.message });
    }
  });


export default router;