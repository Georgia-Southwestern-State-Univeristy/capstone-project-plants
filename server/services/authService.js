import { auth } from '../utils/firebase.js';

// ✅ Register User
export const registerWithEmail = async (email, password, name) => {
    try {
        const user = await auth.createUser({
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
        const user = await auth.getUserByEmail(email);
        return { uid: user.uid, email: user.email, name: user.displayName };
    } catch (error) {
        throw new Error(error.message);
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
