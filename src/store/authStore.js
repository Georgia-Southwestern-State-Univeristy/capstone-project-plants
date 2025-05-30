import { defineStore } from 'pinia';
import { ref } from 'vue';
import { registerUser, loginUser, googleLogin, resetPassword } from '@/api';
import { auth, db, loginWithGoogle } from '@/utils/firebase';
import { signOut, signInWithEmailAndPassword, getAuth  } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import { useNotificationStore } from './notificationStore'; // ✅ Use notification store

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),

  actions: {
    async register(email, password, name) {
      const notificationStore = useNotificationStore();
      this.loading = true;
      this.error = null;
      try {
        const response = await registerUser(email, password, name);
        if (!response.success) throw new Error(response.error || 'Registration failed');

        this.user = response.user;
        notificationStore.addNotification({ type: 'success', message: 'Registration successful!' });

        return response.user;
      } catch (error) {
        this.error = error.message;
        notificationStore.addNotification({ type: 'error', message: error.message || 'Registration failed' });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    
  async login(email, password) {
    this.loading = true;
    this.error = null;

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      this.user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || "User",
      };

      // ✅ Save ID Token in Local Storage
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem("idToken", idToken); // 🔥 Stores token for persistence

      return this.user;
    } catch (error) {
      this.error = error.message;
      throw new Error("Invalid email or password");
    } finally {
      this.loading = false;
    }
  },

  async logout() {
    const auth = getAuth();
    await auth.signOut();
    this.user = null;
    localStorage.removeItem("idToken"); // ✅ Clear token on logout
  },

  async checkAuth() {
    const auth = getAuth();
    const idToken = localStorage.getItem("idToken");

    if (idToken) {
      try {
        const user = auth.currentUser;

        if (!user) {
          throw new Error("User not found, fetching details...");
        }

        // ✅ If the user exists, set it in the store
        this.user = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "User",
        };
      } catch (error) {
        console.error("❌ Token verification failed:", error);
        this.user = null;
        localStorage.removeItem("idToken");
      }
    } else {
      console.warn("🚫 No token found, user is logged out.");
      this.user = null;
    }
  },
  
  async googleLogin() {
    const notificationStore = useNotificationStore();
    this.loading = true;
    this.error = null;
    try {
      const firebaseUser = await loginWithGoogle(); // from firebase.js
      const idToken = await firebaseUser.getIdToken();
  
      const response = await googleLogin(idToken); // from api.js
  
      if (!response.success) throw new Error(response.error || 'Google login failed');
  
      this.user = response.user;
      localStorage.setItem('idToken', idToken);
  
      notificationStore.addNotification({
        type: 'success',
        message: `Welcome ${response.user.name || 'back'}!`
      });
  
      return response.user;
    } catch (error) {
      this.error = error.message;
      notificationStore.addNotification({ type: 'error', message: error.message });
      throw error;
    } finally {
      this.loading = false;
    }
  },
  
  

  async resetPassword(email) {
    const notificationStore = useNotificationStore();
    this.loading = true;
    this.error = null;
    try {
      const response = await resetPassword(email);
      if (!response.success) throw new Error(response.error || 'Password reset failed');

      notificationStore.addNotification({ type: 'success', message: 'Password reset email sent!' });
      return response;
    } catch (error) {
      this.error = error.message;
      notificationStore.addNotification({ type: 'error', message: error.message || 'Password reset failed' });
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async logout() {
    try {
      await signOut(auth);
      this.user = null;
    } catch (error) {
      this.error = error.message;
      throw error;
    }
  },

  async fetchUserProfile() {
    try {
      // ✅ Wait for Firebase to confirm authentication state
      const user = await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
          unsubscribe(); // Stop listening after getting the user
          resolve(firebaseUser);
        });
      });
  
      if (!user) {
        console.warn('User not authenticated, redirecting to login.');
        return null;
      }
  
      const userId = user.uid; // ✅ Now we are sure `user.uid` exists
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        this.user = { uid: userId, ...docSnap.data() };
        return docSnap.data();
      } else {
        console.warn('User profile not found in Firestore.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
},

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
  }
});
