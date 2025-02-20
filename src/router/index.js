// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import landing from '@/views/landing.vue'
import login from '@/views/login.vue'
import register from '@/views/register.vue'
import chat from '@/views/chat.vue'

const routes = [
  { path: '/', name: 'Landing', component: landing },
  { path: '/login', name: 'Login', component: login, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: register, meta: { requiresGuest: true } },
  { path: '/chat', name: 'Chat', component: chat, /*meta: { requiresAuth: true }*/ }, 
  { path: '/userprofile', name: 'Profile', component: () => import('@/views/userprofile.vue'), /*meta: { requiresAuth: true }*/ }
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
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  const user = await getUser(); // ✅ Ensure Firebase Auth is ready before navigating

  if (requiresAuth && !user) {
    next('/login'); // ✅ Redirect to login if user is not authenticated
  } else if (requiresGuest && user) {
    next('/chat'); // ✅ Redirect logged-in users away from login/register
  } else {
    next(); // ✅ Allow navigation
  }
});

export default router;
