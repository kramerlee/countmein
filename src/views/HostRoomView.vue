<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoomStore } from '@/stores/roomStore'
import { useToast } from 'primevue/usetoast'
import { trackQRCode, trackLinkCopy } from '@/utils/analytics'
import QRCode from 'qrcode'
import Button from 'primevue/button'
import QueueItem from '@/components/QueueItem.vue'
import type { SongRequest } from '@/types'

const props = defineProps<{
  roomId: string
}>()

const { t } = useI18n()
const router = useRouter()
const roomStore = useRoomStore()
const toast = useToast()

const qrCodeDataUrl = ref('')
const showQrModal = ref(false)
const activeTab = ref<'queue' | 'completed'>('queue')

const room = computed(() => roomStore.currentRoom)
const queue = computed(() => roomStore.queue)
const pendingRequests = computed(() => roomStore.pendingRequests)
const nextRequest = computed(() => roomStore.nextRequest)
const ongoingRequest = computed(() => roomStore.ongoingRequest)
const completedRequests = computed(() => roomStore.completedRequests)
const isLoading = computed(() => roomStore.isLoading)

const activeQueue = computed(() => {
  const items: SongRequest[] = []
  if (ongoingRequest.value) items.push(ongoingRequest.value)
  if (nextRequest.value) items.push(nextRequest.value)
  items.push(...pendingRequests.value)
  return items
})

const joinUrl = computed(() => {
  const baseUrl = window.location.origin
  return `${baseUrl}/join/${props.roomId}`
})

onMounted(async () => {
  const success = await roomStore.subscribeToRoom(props.roomId)

  if (!success) {
    toast.add({
      severity: 'error',
      summary: t('host.roomNotFound'),
      detail: t('host.roomNotExist'),
      life: 3000
    })
    router.push({ name: 'Home' })
    return
  }

  await generateQrCode()
})

onUnmounted(() => {
  roomStore.unsubscribeFromRoom()
})

// Watch for new requests and show notification
watch(
  () => queue.value.length,
  (newLen, oldLen) => {
    if (newLen > oldLen && roomStore.isHost(props.roomId)) {
      const latestRequest = queue.value[queue.value.length - 1]
      if (latestRequest) {
        toast.add({
          severity: 'info',
          summary: t('host.newRequest'),
          detail: `${latestRequest.guestName} ${t('host.wantsToSing')} "${latestRequest.songName}"`,
          life: 5000
        })
      }
    }
  }
)

async function generateQrCode() {
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(joinUrl.value, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

function copyRoomCode() {
  navigator.clipboard.writeText(props.roomId)
  toast.add({
    severity: 'success',
    summary: t('common.copied'),
    detail: t('host.codeCopied'),
    life: 2000
  })
}

function copyJoinLink() {
  trackLinkCopy(props.roomId)
  navigator.clipboard.writeText(joinUrl.value)
  toast.add({
    severity: 'success',
    summary: t('common.copied'),
    detail: t('host.linkCopied'),
    life: 2000
  })
}

function openQrModal() {
  trackQRCode('view', props.roomId)
  showQrModal.value = true
}

function shareRoom() {
  if (navigator.share) {
    navigator.share({
      title: t('app.name'),
      text: `${t('common.room')} ${props.roomId}`,
      url: joinUrl.value
    })
  } else {
    copyJoinLink()
  }
}

function updateStatus(requestId: string, status: SongRequest['status']) {
  roomStore.updateRequestStatus(props.roomId, requestId, status)
}

function removeRequest(requestId: string) {
  roomStore.removeRequest(props.roomId, requestId)
}
</script>

<template>
  <div class="host-room">
    <!-- Loading State -->
    <div
      v-if="isLoading && !room"
      class="loading-state"
    >
      <i class="pi pi-spin pi-spinner" />
      <p>{{ t('host.connecting') }}</p>
    </div>

    <template v-else>
      <!-- Room Header -->
      <div class="room-header">
        <div class="room-info">
          <span class="room-label">{{ t('common.roomCode') }}</span>
          <div class="room-code-wrapper">
            <span class="room-code">{{ roomId }}</span>
            <button
              class="copy-btn"
              @click="copyRoomCode"
            >
              <i class="pi pi-copy" />
            </button>
          </div>
        </div>

        <div class="room-actions">
          <Button
            v-tooltip.bottom="t('host.scanToJoin')"
            icon="pi pi-qrcode"
            class="action-btn"
            @click="openQrModal"
          />
          <Button
            v-tooltip.bottom="t('common.share')"
            icon="pi pi-share-alt"
            class="action-btn"
            @click="shareRoom"
          />
        </div>
      </div>

      <!-- QR Code Modal -->
      <Teleport to="body">
        <div
          v-if="showQrModal"
          class="qr-modal-overlay"
          @click="showQrModal = false"
        >
          <div
            class="qr-modal"
            @click.stop
          >
            <button
              class="close-modal"
              @click="showQrModal = false"
            >
              <i class="pi pi-times" />
            </button>
            <h2>{{ t('host.scanToJoin') }}</h2>
            <div class="qr-code-container">
              <img
                :src="qrCodeDataUrl"
                alt="QR Code"
                class="qr-code"
              >
            </div>
            <p class="qr-room-code">
              {{ roomId }}
            </p>
            <Button
              :label="t('host.copyLink')"
              icon="pi pi-link"
              class="copy-link-btn"
              @click="copyJoinLink"
            />
          </div>
        </div>
      </Teleport>

      <!-- Queue Stats -->
      <div class="queue-stats">
        <div class="stat">
          <span class="stat-value">{{ activeQueue.length }}</span>
          <span class="stat-label">{{ t('host.inQueue') }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ completedRequests.length }}</span>
          <span class="stat-label">{{ t('host.completed') }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'queue' }"
          @click="activeTab = 'queue'"
        >
          <i class="pi pi-list" />
          {{ t('host.queue') }}
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'completed' }"
          @click="activeTab = 'completed'"
        >
          <i class="pi pi-check-circle" />
          {{ t('host.completed') }}
        </button>
      </div>

      <!-- Queue List -->
      <div
        v-if="activeTab === 'queue'"
        class="queue-list"
      >
        <div
          v-if="activeQueue.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">
            <i class="pi pi-inbox" />
          </div>
          <h3>{{ t('host.noRequests') }}</h3>
          <p>{{ t('host.shareQrCode') }}</p>
        </div>

        <TransitionGroup
          name="list"
          tag="div"
          class="queue-items"
        >
          <QueueItem
            v-for="(request, index) in activeQueue"
            :key="request.id"
            :request="request"
            :position="index + 1"
            @update-status="(status) => updateStatus(request.id, status)"
            @remove="removeRequest(request.id)"
          />
        </TransitionGroup>
      </div>

      <!-- Completed List -->
      <div
        v-else
        class="queue-list"
      >
        <div
          v-if="completedRequests.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">
            <i class="pi pi-check-circle" />
          </div>
          <h3>{{ t('host.noCompleted') }}</h3>
          <p>{{ t('host.completedHere') }}</p>
        </div>

        <TransitionGroup
          name="list"
          tag="div"
          class="queue-items"
        >
          <QueueItem
            v-for="request in completedRequests"
            :key="request.id"
            :request="request"
            :readonly="true"
            @remove="removeRequest(request.id)"
          />
        </TransitionGroup>
      </div>
    </template>
  </div>
</template>

<style scoped>
.host-room {
  padding-bottom: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
}

.loading-state i {
  font-size: 2rem;
  color: var(--accent-color);
}

.loading-state p {
  color: var(--text-secondary);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.room-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  font-weight: 600;
}

.room-code-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.room-code {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: var(--accent-color);
}

.copy-btn {
  background: var(--accent-light);
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  cursor: pointer;
  color: var(--accent-color);
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--accent-color);
  color: white;
}

.room-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  width: 2.75rem !important;
  height: 2.75rem !important;
}

.action-btn:hover {
  background: var(--accent-light) !important;
  border-color: var(--accent-color) !important;
  color: var(--accent-color) !important;
}

/* QR Modal */
.qr-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.qr-modal {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  position: relative;
  max-width: 340px;
  width: 100%;
  animation: slideUp 0.3s ease;
}

.close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--bg-secondary);
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.close-modal:hover {
  background: var(--accent-color);
  color: white;
}

.qr-modal h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.qr-code-container {
  background: white;
  border-radius: var(--radius-md);
  padding: 1rem;
  display: inline-block;
}

.qr-code {
  display: block;
  width: 100%;
  max-width: 260px;
}

.qr-room-code {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: var(--accent-color);
  margin: 1.5rem 0;
}

.copy-link-btn {
  width: 100%;
  background: var(--text-primary) !important;
  border: none !important;
}

.dark-mode .copy-link-btn {
  background: var(--accent-color) !important;
}

/* Queue Stats */
.queue-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--accent-color);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  font-weight: 600;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active {
  background: var(--surface-elevated);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.tab:hover:not(.active) {
  color: var(--text-primary);
}

/* Queue List */
.queue-list {
  min-height: 200px;
}

.queue-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
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
}

/* List animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
