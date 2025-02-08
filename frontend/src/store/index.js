import { createStore } from 'vuex'
import { auth, db } from '@/utils/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

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
      state.user = user
    },
    SET_PLANT_ANALYSIS(state, analysis) {
      state.plantAnalysis = analysis
    },
    SET_CHAT_HISTORY(state, history) {
      state.chatHistory = history
    },
    ADD_CHAT_MESSAGE(state, message) {
      state.chatHistory.push(message)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        ...notification
      })
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id)
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },

  actions: {
    // Authentication actions
    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        commit('SET_USER', userCredential.user)
        return userCredential.user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async register({ commit }, { email, password, name }) {
      commit('SET_LOADING', true)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          createdAt: new Date()
        })
        
        commit('SET_USER', userCredential.user)
        return userCredential.user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      try {
        await signOut(auth)
        commit('SET_USER', null)
        commit('SET_CHAT_HISTORY', [])
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    // Chat actions
    async sendMessage({ commit, state }, message) {
      commit('SET_LOADING', true)
      try {
        commit('ADD_CHAT_MESSAGE', {
          ...message,
          timestamp: new Date()
        })
        
        // Save to Firestore
        if (state.user) {
          await setDoc(doc(db, `chats/${state.user.uid}/messages`, Date.now().toString()), {
            ...message,
            timestamp: new Date()
          })
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    actions: {
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
      }
  },

    // Notification actions
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', notification.id)
      }, notification.timeout || 5000)
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
})