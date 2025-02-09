import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Load Firebase Admin Credentials
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let serviceAccount = null;

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} else {
    console.error("❌ Firebase service account file not found! Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set correctly.");
    process.exit(1);
}

// Initialize Firebase Admin SDK (only if not already initialized)
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

const adminAuth = getAuth();
const adminDb = getFirestore();
const adminStorage = getStorage();

export { adminAuth, adminDb, adminStorage };
