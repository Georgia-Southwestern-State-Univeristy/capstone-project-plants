// utils/firebase.js


import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendEmailVerification,
  signInWithCredential
} from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { logger } from '../services/logging.js';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  
};





// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Auth state observer
export const initAuthStateObserver = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      logger.logInfo('User is signed in', { userId: user.uid });
    } else {
      logger.logInfo('User is signed out');
    }
    callback(user);
  });
};

// Email/Password Authentication
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    logger.logInfo('Email login successful', { userId: userCredential.user.uid });
    return userCredential.user;
  } catch (error) {
    logger.logError('Email login failed', error);
    throw new Error(`Login failed: ${error.message}`);
  }
};

export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    logger.logInfo('Email registration successful', { userId: userCredential.user.uid });
    return userCredential.user;
  } catch (error) {
    logger.logError('Email registration failed', error);
    throw new Error(`Registration failed: ${error.message}`);
  }
};


// Google Authentication
export const loginWithGoogle = async () => {
  try {
    // Initialize Google Sign-In
    google.accounts.id.initialize({
      client_id: process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID,
      callback: async (response) => {
        try {
          const backendResponse = await fetch("http://127.0.0.1:5000/auth/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: response.credential })
          });
          const data = await backendResponse.json();
          console.log("Backend response:", data);

          // Handle successful authentication
          if (data.success) {
            // Use existing Firebase GoogleAuthProvider
            const credential = GoogleAuthProvider.credential(response.credential);
            const userCredential = await signInWithCredential(auth, credential);
            return userCredential.user;
          }
        } catch (error) {
          console.error('Backend authentication failed:', error);
          throw new Error('Authentication failed');
        }
      }
    });
    
    // Show Google Sign-In prompt
    google.accounts.id.prompt();
  } catch (error) {
    console.error('Google login failed:', error);
    throw new Error(error.message);
  }  try {
    // Add fallback here
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (popupError) {
    throw new Error(popupError.message);
  }
};



// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    logger.logInfo('Password reset email sent', { email });
  } catch (error) {
    logger.logError('Password reset failed', error);
    throw new Error(`Password reset failed: ${error.message}`);
  }
};

// Update Profile
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is signed in');

    await updateProfile(user, updates);
    logger.logInfo('Profile updated successfully', { userId: user.uid });
  } catch (error) {
    logger.logError('Profile update failed', error);
    throw new Error(`Profile update failed: ${error.message}`);
  }
};

// Sign Out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    logger.logInfo('User signed out successfully');
  } catch (error) {
    logger.logError('Sign out failed', error);
    throw new Error(`Sign out failed: ${error.message}`);
  }
};


let analytics = null;
if (typeof window !== 'undefined') {  // Check if running in browser
    analytics = getAnalytics(app);
}



export const trackEvent = (eventName, eventParams = {}) => {
  if (analytics) {  // Only track if analytics is initialized
      try {
          analytics.logEvent(eventName, {
              timestamp: new Date().toISOString(),
              ...eventParams
          });
      } catch (error) {
          console.error('Analytics error:', error);
      }
  }
};


export const trackPageView = (pageName) => {
  if (analytics) {
      trackEvent('page_view', { page_name: pageName });
  }
};

// Get Current User
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check Auth State
export const isUserAuthenticated = () => {
  return !!auth.currentUser;
};

// Check Email Verification
export const isEmailVerified = () => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

// Export instances
export { auth, db, storage };