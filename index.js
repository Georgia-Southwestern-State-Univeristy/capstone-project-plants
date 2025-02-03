import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/utils/firebase'
import landing from '@/views/landing.vue'
import login from '@/views/login.vue'
import register from '@/views/register.vue'
import chat from '@/views/chat.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: landing
  },
  {
    path: '/login',
    name: 'Login',
    component: login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: register,
    meta: { requiresGuest: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: chat,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/chat')
  } else {
    next()
  }
})

export default router