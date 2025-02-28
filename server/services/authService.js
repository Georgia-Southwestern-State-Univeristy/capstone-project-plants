import { auth, db } from '../utils/firebaseAdmin.js'; // Import Firestore instance
import axios from 'axios';

// ✅ Register User & Store in Firestore
export const registerWithEmail = async (email, password, name) => {
    try {
        // 🔹 Create user in Firebase Authentication
        const user = await auth.createUser({
            email,
            password,
            displayName: name
        });

        // 🔹 Store user in Firestore
        const userRef = db.collection('users').doc(user.uid);
        await userRef.set({
            uid: user.uid,
            email: user.email,
            username: name,
            profileImage: "",
            createdAt: new Date().toISOString()
        });

        console.log(`✅ User registered & saved in Firestore: ${user.uid}`);

        return { uid: user.uid, email: user.email, name: user.displayName };
    } catch (error) {
        console.error("❌ Error registering user:", error);
        throw new Error(error.message);
    }
};


// ✅ Login User (Backend verification)
export const loginWithEmail = async (email, password) => {
    try {
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
            {
                email,
                password,
                returnSecureToken: true,
            }
        );

        return {
            uid: response.data.localId,
            email: response.data.email,
            idToken: response.data.idToken,
            refreshToken: response.data.refreshToken,
        };
    } catch (error) {
        throw new Error(error.response.data.error.message);
    }
};

// ✅ Reset Password
export const resetPassword = async (email) => {
    try {
        await auth.generatePasswordResetLink(email);
        return { success: true, message: "Password reset link sent." };
    } catch (error) {
        throw new Error(error.message);
    }
};
