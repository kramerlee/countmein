import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
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
  history: createWebHistory(),
  routes
})

export default router

