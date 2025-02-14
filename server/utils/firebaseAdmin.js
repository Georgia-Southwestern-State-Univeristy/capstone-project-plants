
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../services/logging.js';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
// ✅ Initialize Firebase Admin SDK (Server Only)
const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app); // Firebase Admin Auth (for backend authentication)
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Google OAuth Client for verifying Google Sign-In tokens
const googleClient = new OAuth2Client(process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID);

/**
 * ✅ Verify Firebase ID Token (Google Sign-In Flow)
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
 * @param {string} idToken - Google ID token from frontend
 * @returns {object} - Firebase user credentials
 */
export const authenticateGoogleUser = async (idToken) => {
  try {
    // Verify the Google ID Token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Get user details
    const { uid, email, name, picture } = decodedToken;

    // Optionally, create or update user record in Firestore
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
