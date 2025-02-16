import { createStore } from 'vuex';
import { registerUser, loginUser, googleLogin, resetPassword,sendChatMessage } from '@/api'; // ✅ Import API functions
import { auth, db } from '@/utils/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default createStore({
  state: {
    user: null,
    plantAnalysis: null,
    chatHistory: [],
    loading: false,
    error: null,
    notifications: []
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        ...notification
      });
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },

  actions: {
    // ✅ API-based User Registration
    async register({ commit, dispatch }, { email, password, name }) {
      commit('SET_LOADING', true);
      try {
        const response = await registerUser(email, password, name);
        if (!response.success) throw new Error(response.error || 'Registration failed');

        commit('SET_USER', response.user);
        dispatch('addNotification', { type: 'success', message: 'Registration successful!' });

        return response.user;
      } catch (error) {
        commit('SET_ERROR', error.message);
        dispatch('addNotification', { type: 'error', message: error.message || 'Registration failed' });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // ✅ API-based User Login
    async login({ commit, dispatch }, { email, password }) {
      commit('SET_LOADING', true);
      try {
        const response = await loginUser(email, password);
        if (!response.success) throw new Error(response.error || 'Login failed');

        commit('SET_USER', response.user);
        return response.user;
      } catch (error) {
        commit('SET_ERROR', error.message);
        dispatch('addNotification', { type: 'error', message: error.message || 'Login failed' });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // ✅ API-based Google Login
    async googleLogin({ commit, dispatch }) {
      commit('SET_LOADING', true);
      try {
        const response = await googleLogin();
        if (!response.success) throw new Error(response.error || 'Google login failed');

        commit('SET_USER', response.user);
        return response.user;
      } catch (error) {
        commit('SET_ERROR', error.message);
        dispatch('addNotification', { type: 'error', message: error.message || 'Google login failed' });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // ✅ API-based Password Reset
    async resetPassword({ commit, dispatch }, { email }) {
      commit('SET_LOADING', true);
      try {
        const response = await resetPassword(email);
        if (!response.success) throw new Error(response.error || 'Password reset failed');

        dispatch('addNotification', { type: 'success', message: 'Password reset email sent!' });
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        dispatch('addNotification', { type: 'error', message: error.message || 'Password reset failed' });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // ✅ Logout
    async logout({ commit }) {
      try {
        await signOut(auth);
        commit('SET_USER', null);
        commit('SET_CHAT_HISTORY', []);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },

    // ✅ Fetch User Profile
    async fetchUserProfile({ commit }, userId) {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          commit('SET_USER_PROFILE', docSnap.data());
          return docSnap.data();
        } else {
          console.log('No such document!');
          return null;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },

    // ✅ Notification actions
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', notification.id);
      }, notification.timeout || 5000);
    },

    // ✅ Chat actions
    async sendMessage({ commit, state }, message) {
      commit('SET_LOADING', true);
      try {
        commit('ADD_CHAT_MESSAGE', {
          ...message,
          timestamp: new Date()
        });
    
        // ✅ Keep storing chat messages in Firestore
        if (state.user) {
          await setDoc(doc(db, `chats/${state.user.uid}/messages`, Date.now().toString()), {
            ...message,
            timestamp: new Date()
          });
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
    
  },

  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    chatHistory: state => state.chatHistory,
    loading: state => state.loading,
    error: state => state.error,
    notifications: state => state.notifications
  }
});
