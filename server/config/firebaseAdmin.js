
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../functions/services/loggingService.js';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// ✅ Initialize Firebase Admin SDK 
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.VITE_APP_FIREBASE_STORAGE_BUCKET, 
});

const auth = getAuth(app); 
const db = getFirestore(app);
const storage = getStorage(app);


const googleClient = new OAuth2Client(process.env.VITE_APP_GOOGLE_OAUTH_CLIENT_ID);

/**
 * ✅ Verify Firebase ID Token 
 * @param {string} idToken - Firebase ID Token from frontend
 * @returns {object} - Decoded Firebase user information
 */
export const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    logger.logInfo('Token verified', { userId: decodedToken.uid });
    return decodedToken;
  } catch (error) {
    logger.logError('Token verification failed', error);
    throw new Error('Invalid or expired token');
  }
};

/**
 * ✅ Handle Google Sign-In via Backend
 * @param {string} 
 * @returns {object} - Firebase user credentials
 */
export const authenticateGoogleUser = async (idToken) => {
  try {
    // Verify the Google ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Get user details
    const { uid, email, name, picture } = decodedToken;

    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        name,
        picture,
        createdAt: new Date().toISOString(),
      });
    }

    logger.logInfo('Google authentication successful', { userId: uid });

    return { uid, email, name, picture };
  } catch (error) {
    logger.logError('Google authentication failed', error);
    throw new Error('Authentication failed');
  }
};

// ✅ Export server-side Firebase instances
export { auth, db, storage, googleClient };
