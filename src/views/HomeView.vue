<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoomStore } from '@/stores/roomStore'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const router = useRouter()
const roomStore = useRoomStore()

const joinRoomId = ref('')
const joinError = ref('')
const isCreating = ref(false)
const isJoining = ref(false)

const isConfigured = computed(() => roomStore.isConfigured)

async function createRoom() {
  try {
    isCreating.value = true
    const room = await roomStore.createRoom()
    router.push({ name: 'HostRoom', params: { roomId: room.id } })
  } catch {
    joinError.value = t('home.failedCreate')
  } finally {
    isCreating.value = false
  }
}

async function joinRoom() {
  const roomId = joinRoomId.value.trim().toUpperCase()

  if (!roomId) {
    joinError.value = t('home.enterCode')
    return
  }

  try {
    isJoining.value = true
    const exists = await roomStore.roomExists(roomId)

    if (!exists) {
      joinError.value = t('home.roomNotFound')
      return
    }

    router.push({ name: 'JoinRoom', params: { roomId } })
  } catch {
    joinError.value = t('home.failedCheck')
  } finally {
    isJoining.value = false
  }
}
</script>

<template>
  <div class="home-view">
    <div class="hero">
      <div class="hero-icon">
        <i class="pi pi-microphone" />
      </div>
      <h1 class="hero-title">
        {{ t('app.name') }}
      </h1>
      <p class="hero-subtitle">
        {{ t('app.tagline') }}
      </p>
    </div>

    <!-- Firebase Configuration Warning -->
    <div
      v-if="!isConfigured"
      class="config-warning"
    >
      <i class="pi pi-exclamation-triangle" />
      <div class="warning-content">
        <strong>{{ t('config.notConfigured') }}</strong>
        <p>{{ t('config.setupMessage') }}</p>
      </div>
    </div>

    <div class="actions">
      <div class="action-card host-card">
        <div class="action-icon">
          <i class="pi pi-star" />
        </div>
        <h2>{{ t('home.hostTitle') }}</h2>
        <p>{{ t('home.hostDesc') }}</p>
        <Button
          :label="t('home.createRoom')"
          icon="pi pi-plus"
          class="btn-action"
          :loading="isCreating"
          :disabled="isCreating"
          @click="createRoom"
        />
      </div>

      <div class="divider">
        <span>{{ t('common.or') }}</span>
      </div>

      <div class="action-card join-card">
        <div class="action-icon">
          <i class="pi pi-users" />
        </div>
        <h2>{{ t('home.joinTitle') }}</h2>
        <p>{{ t('home.joinDesc') }}</p>

        <div class="join-form">
          <InputText
            v-model="joinRoomId"
            :placeholder="t('home.enterRoomCode')"
            class="room-code-input"
            :disabled="isJoining"
            @keyup.enter="joinRoom"
            @input="joinError = ''"
          />
          <Button
            :label="t('home.join')"
            icon="pi pi-sign-in"
            class="btn-join"
            :loading="isJoining"
            :disabled="isJoining"
            @click="joinRoom"
          />
        </div>

        <p
          v-if="joinError"
          class="error-message"
        >
          {{ joinError }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding-bottom: 2rem;
}

.config-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: var(--warning-light);
  border: 1px solid var(--warning-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.config-warning i {
  font-size: 1.25rem;
  color: var(--warning-color);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-content strong {
  display: block;
  color: var(--warning-color);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.warning-content p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.hero {
  text-align: center;
  padding: 2rem 0 3rem;
}

.hero-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent-color), #ff9f5a);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 12px 32px rgba(232, 93, 4, 0.3);
}

.hero-icon i {
  font-size: 2.5rem;
  color: white;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 280px;
  margin: 0 auto;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  text-align: center;
  transition: all 0.3s ease;
}

.action-card:hover {
  box-shadow: var(--shadow-md);
}

.action-icon {
  width: 56px;
  height: 56px;
  background: var(--accent-light);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.action-icon i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.action-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.action-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

.btn-action {
  width: 100%;
  justify-content: center;
  background: var(--accent-color) !important;
  border: none !important;
  padding: 0.875rem 1.5rem !important;
  font-weight: 600 !important;
  border-radius: var(--radius-md) !important;
}

.btn-action:hover {
  background: var(--accent-hover) !important;
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.join-form {
  display: flex;
  gap: 0.5rem;
}

.room-code-input {
  flex: 1;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-align: center;
}

.room-code-input::placeholder {
  text-transform: none;
  letter-spacing: normal;
}

.btn-join {
  background: var(--text-primary) !important;
  border: none !important;
  padding: 0.875rem 1.25rem !important;
  font-weight: 600 !important;
  border-radius: var(--radius-md) !important;
}

.dark-mode .btn-join {
  background: var(--surface-elevated) !important;
  border: 1px solid var(--border-color) !important;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  margin-bottom: 0;
}
</style>
