// store/index.js
import { createStore } from 'vuex'
import { auth } from '@/utils/firebase'

export default createStore({
 state: {
   user: null,
   plantAnalysis: null,
   chatHistory: [],
   loading: false,
   error: null
 },

 mutations: {
   SET_USER(state, user) {
     state.user = user
   },
   SET_PLANT_ANALYSIS(state, analysis) {
     state.plantAnalysis = analysis 
   },
   ADD_CHAT_MESSAGE(state, message) {
     state.chatHistory.push(message)
   },
   SET_LOADING(state, loading) {
     state.loading = loading
   },
   SET_ERROR(state, error) {
     state.error = error
   }
 },

 actions: {
   async login({ commit }, { email, password }) {
     try {
       const userCred = await auth.signInWithEmailAndPassword(email, password)
       commit('SET_USER', userCred.user)
     } catch (error) {
       commit('SET_ERROR', error.message)
       throw error
     }
   },

   async register({ commit }, { email, password }) {
     try {
       const userCred = await auth.createUserWithEmailAndPassword(email, password)
       commit('SET_USER', userCred.user)
     } catch (error) {
       commit('SET_ERROR', error.message)
       throw error
     }
   },

   async logout({ commit }) {
     try {
       await auth.signOut()
       commit('SET_USER', null)
     } catch (error) {
       commit('SET_ERROR', error.message)
       throw error
     }
   },

   async analyzePlant({ commit }, imageFile) {
     commit('SET_LOADING', true)
     try {
       // Call your plant analysis API
       const analysis = await fetch('/api/analyze', {
         method: 'POST',
         body: imageFile
       }).then(res => res.json())
       
       commit('SET_PLANT_ANALYSIS', analysis)
     } catch (error) {
       commit('SET_ERROR', error.message)
       throw error
     } finally {
       commit('SET_LOADING', false)
     }
   }
 },

 getters: {
   isAuthenticated: state => !!state.user,
   currentUser: state => state.user,
   chatHistory: state => state.chatHistory,
   plantAnalysis: state => state.plantAnalysis,
   isLoading: state => state.loading,
   error: state => state.error
 }
})