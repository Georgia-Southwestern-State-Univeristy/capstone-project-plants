// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import landing from '@/views/landing.vue'
import login from '@/views/login.vue'
import register from '@/views/register.vue'
import chat from '@/views/chat.vue'
import add from '@/views/addplant.vue'
import { useAuthStore } from '@/store/authStore';  

const routes = [
  { path: '/', name: 'Landing', component: landing },
  { path: '/login', name: 'Login', component: login, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: register, meta: { requiresGuest: true } },
  { path: '/chat', name: 'Chat', component: chat, /*meta: { requiresAuth: true }*/ }, 
  { path: '/userprofile', name: 'Profile', component: () => import('@/views/userprofile.vue'), /*meta: { requiresAuth: true }*/ },
  { path: '/addplant', name: 'Add', component: add}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const auth = getAuth()

// ✅ Fix: Use a Promise to wait for Firebase Auth before navigating
function getUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Stop listening after getting the user
      resolve(user);
    });
  });
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    console.log("⏳ Waiting for authentication...");
    await authStore.fetchUserProfile(); // ✅ Waits for authentication before checking profile
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresAuth && !authStore.isAuthenticated) {
    console.warn("🚫 Not authenticated, redirecting to login.");
    next('/login');
  } else if (requiresGuest && authStore.isAuthenticated) {
    next('/chat');
  } else {
    next();
  }
});




export default router;
