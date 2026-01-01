<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/roomStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const roomStore = useRoomStore()
const authStore = useAuthStore()

onMounted(async () => {
  // Require authentication to create rooms
  if (!authStore.isAuthenticated || !authStore.user) {
    router.replace({ name: 'Login', query: { redirect: '/host' } })
    return
  }

  try {
    // Create room with authenticated user's ID
    const room = await roomStore.createRoom(authStore.user.uid)
    router.replace({ name: 'HostRoom', params: { roomId: room.id } })
  } catch {
    router.replace({ name: 'Dashboard' })
  }
})
</script>

<template>
  <div class="creating-room">
    <div class="loader">
      <i class="pi pi-spin pi-spinner" />
    </div>
    <p>Creating your room...</p>
  </div>
</template>

<style scoped>
.creating-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
}

.loader i {
  font-size: 2rem;
  color: var(--accent-color);
}

.creating-room p {
  color: var(--text-secondary);
}
</style>
