import { adminAuth } from '../utils/firebaseAdmin.js';

// ✅ Register User
export const registerWithEmail = async (email, password, name) => {
    try {
        const user = await adminAuth.createUser({
            email,
            password,
            displayName: name
        });
        return { uid: user.uid, email: user.email, name: user.displayName };
    } catch (error) {
        throw new Error(error.message);
    }
};

// ✅ Login User (Backend verification)
export const loginWithEmail = async (email) => {
    try {
        const user = await adminAuth.getUserByEmail(email);
        return { uid: user.uid, email: user.email, name: user.displayName };
    } catch (error) {
        throw new Error(error.message);
    }
};

// ✅ Reset Password
export const resetPassword = async (email) => {
    try {
        await adminAuth.generatePasswordResetLink(email);
        return { success: true, message: "Password reset link sent." };
    } catch (error) {
        throw new Error(error.message);
    }
};
