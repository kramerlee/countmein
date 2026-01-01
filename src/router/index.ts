import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/LandingView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/host',
    name: 'CreateRoom',
    component: () => import('@/views/CreateRoomView.vue')
  },
  {
    path: '/room/:roomId',
    name: 'HostRoom',
    component: () => import('@/views/HostRoomView.vue'),
    props: true
  },
  {
    path: '/join/:roomId',
    name: 'JoinRoom',
    component: () => import('@/views/GuestView.vue'),
    props: true
  },
  {
    path: '/guest/:roomId/submitted',
    name: 'GuestSubmitted',
    component: () => import('@/views/GuestSubmittedView.vue'),
    props: true
  }
]

const router = createRouter({
  // Use BASE_URL from Vite config (set via VITE_BASE_URL env var)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize
  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  // Protected routes - require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Guest-only routes - redirect logged-in users
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
