<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useRoomStore } from '@/stores/roomStore'
import Button from 'primevue/button'
import type { Room } from '@/types'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const roomStore = useRoomStore()

const userRooms = ref<Room[]>([])
const isLoading = ref(true)

const user = computed(() => authStore.user)

onMounted(async () => {
  if (authStore.user) {
    await loadUserRooms()
  }
})

onUnmounted(() => {
  roomStore.unsubscribeFromUserRooms()
})

async function loadUserRooms() {
  isLoading.value = true
  userRooms.value = await roomStore.getUserRooms(authStore.user!.uid)
  isLoading.value = false
}

async function createNewRoom() {
  const room = await roomStore.createRoom(authStore.user?.uid)
  if (room) {
    router.push({ name: 'HostRoom', params: { roomId: room.id } })
  }
}

function openRoom(roomId: string) {
  router.push({ name: 'HostRoom', params: { roomId } })
}

function getRoomStatus(room: Room): { label: string; class: string } {
  const now = new Date()
  const expiresAt = room.expiresAt instanceof Date ? room.expiresAt : new Date(room.expiresAt)
  
  if (expiresAt < now) {
    return { label: t('dashboard.expired'), class: 'status-expired' }
  }
  
  const ongoingCount = room.queue.filter(r => r.status === 'ongoing').length
  const pendingCount = room.queue.filter(r => r.status === 'pending' || r.status === 'next').length
  
  if (ongoingCount > 0) {
    return { label: t('dashboard.active'), class: 'status-active' }
  }
  
  if (pendingCount > 0) {
    return { label: `${pendingCount} ${t('dashboard.pending')}`, class: 'status-pending' }
  }
  
  return { label: t('dashboard.empty'), class: 'status-empty' }
}

function getTimeRemaining(room: Room): string {
  const now = new Date()
  const expiresAt = room.expiresAt instanceof Date ? room.expiresAt : new Date(room.expiresAt)
  const diff = expiresAt.getTime() - now.getTime()
  
  if (diff <= 0) return t('dashboard.expired')
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="welcome">
        <h1>{{ t('dashboard.welcome') }}, {{ user?.displayName || t('dashboard.host') }}!</h1>
        <p>{{ t('dashboard.subtitle') }}</p>
      </div>
      <Button
        :label="t('dashboard.createRoom')"
        icon="pi pi-plus"
        class="create-btn"
        @click="createNewRoom"
      />
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ userRooms.length }}</span>
        <span class="stat-label">{{ t('dashboard.totalRooms') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ userRooms.filter(r => getRoomStatus(r).class === 'status-active').length }}</span>
        <span class="stat-label">{{ t('dashboard.activeRooms') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ userRooms.reduce((sum, r) => sum + r.queue.length, 0) }}</span>
        <span class="stat-label">{{ t('dashboard.totalRequests') }}</span>
      </div>
    </div>

    <!-- Room List -->
    <div class="rooms-section">
      <h2>{{ t('dashboard.yourRooms') }}</h2>
      
      <div
        v-if="isLoading"
        class="loading-state"
      >
        <i class="pi pi-spin pi-spinner" />
        <p>{{ t('common.loading') }}</p>
      </div>

      <div
        v-else-if="userRooms.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          <i class="pi pi-inbox" />
        </div>
        <h3>{{ t('dashboard.noRooms') }}</h3>
        <p>{{ t('dashboard.noRoomsDesc') }}</p>
        <Button
          :label="t('dashboard.createFirstRoom')"
          icon="pi pi-plus"
          class="create-first-btn"
          @click="createNewRoom"
        />
      </div>

      <div
        v-else
        class="room-list"
      >
        <div
          v-for="room in userRooms"
          :key="room.id"
          class="room-card"
          @click="openRoom(room.id)"
        >
          <div class="room-main">
            <div class="room-code">{{ room.id }}</div>
            <div class="room-meta">
              <span class="created">{{ formatDate(room.createdAt) }}</span>
              <span
                class="status-badge"
                :class="getRoomStatus(room).class"
              >
                {{ getRoomStatus(room).label }}
              </span>
            </div>
          </div>
          <div class="room-details">
            <div class="detail">
              <i class="pi pi-list" />
              <span>{{ room.queue.length }} {{ t('dashboard.songs') }}</span>
            </div>
            <div class="detail">
              <i class="pi pi-clock" />
              <span>{{ getTimeRemaining(room) }}</span>
            </div>
          </div>
          <div class="room-arrow">
            <i class="pi pi-chevron-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.welcome h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.welcome p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.create-btn {
  background: var(--accent-color) !important;
  border: none !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--accent-color);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
}

.rooms-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-state i {
  font-size: 2rem;
  color: var(--accent-color);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-icon i {
  font-size: 1.5rem;
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.create-first-btn {
  background: var(--accent-color) !important;
  border: none !important;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.room-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.room-main {
  flex: 1;
}

.room-code {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent-color);
  margin-bottom: 0.25rem;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.created {
  color: var(--text-muted);
}

.status-badge {
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-pending {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.status-empty {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.status-expired {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.room-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.detail i {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.room-arrow {
  color: var(--text-muted);
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .room-details {
    display: none;
  }
}
</style>

