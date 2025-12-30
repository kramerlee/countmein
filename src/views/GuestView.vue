<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoomStore } from '@/stores/roomStore'
import { useToast } from 'primevue/usetoast'
import { trackSongSubmit } from '@/utils/analytics'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const props = defineProps<{
  roomId: string
}>()

const { t } = useI18n()
const router = useRouter()
const roomStore = useRoomStore()
const toast = useToast()

const guestName = ref('')
const songName = ref('')
const youtubeLink = ref('')
const isSubmitting = ref(false)
const isChecking = ref(true)
const errors = ref<{ guestName?: string; songName?: string; youtubeLink?: string }>({})

onMounted(async () => {
  // Check if room exists
  const exists = await roomStore.roomExists(props.roomId)

  if (!exists) {
    toast.add({
      severity: 'error',
      summary: t('host.roomNotFound'),
      detail: t('guest.roomClosed'),
      life: 3000
    })
    router.push({ name: 'Home' })
    return
  }

  isChecking.value = false

  // Pre-fill guest name if saved
  const savedName = localStorage.getItem('countmein_guest_name')
  if (savedName) {
    guestName.value = savedName
  }
})

function validateForm(): boolean {
  errors.value = {}

  if (!guestName.value.trim()) {
    errors.value.guestName = t('guest.nameRequired')
  }

  if (!songName.value.trim()) {
    errors.value.songName = t('guest.songRequired')
  }

  if (youtubeLink.value.trim()) {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (!ytRegex.test(youtubeLink.value.trim())) {
      errors.value.youtubeLink = t('guest.invalidYoutube')
    }
  }

  return Object.keys(errors.value).length === 0
}

async function submitRequest() {
  if (!validateForm()) return

  isSubmitting.value = true

  const request = await roomStore.addSongRequest(
    props.roomId,
    guestName.value.trim(),
    songName.value.trim(),
    youtubeLink.value.trim() || undefined
  )

  if (request) {
    // Track song submission
    trackSongSubmit(props.roomId)

    // Store guest name for future submissions
    localStorage.setItem('countmein_guest_name', guestName.value.trim())

    router.push({
      name: 'GuestSubmitted',
      params: { roomId: props.roomId }
    })
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('guest.submitFailed'),
      life: 3000
    })
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="guest-view">
    <!-- Loading State -->
    <div
      v-if="isChecking"
      class="loading-state"
    >
      <i class="pi pi-spin pi-spinner" />
      <p>{{ t('guest.checkingRoom') }}</p>
    </div>

    <template v-else>
      <div class="guest-header">
        <div class="room-badge">
          <i class="pi pi-users" />
          <span>{{ t('common.room') }} {{ roomId }}</span>
        </div>
        <h1>{{ t('guest.addSong') }}</h1>
        <p>{{ t('guest.fillDetails') }}</p>
      </div>

      <form
        class="song-form"
        @submit.prevent="submitRequest"
      >
        <div class="form-group">
          <label
            class="form-label"
            for="guestName"
          >
            {{ t('guest.yourName') }} <span class="required">{{ t('guest.required') }}</span>
          </label>
          <InputText
            id="guestName"
            v-model="guestName"
            :placeholder="t('guest.enterName')"
            class="form-input"
            :class="{ 'p-invalid': errors.guestName }"
          />
          <small
            v-if="errors.guestName"
            class="error-text"
          >{{ errors.guestName }}</small>
        </div>

        <div class="form-group">
          <label
            class="form-label"
            for="songName"
          >
            {{ t('guest.songName') }} <span class="required">{{ t('guest.required') }}</span>
          </label>
          <InputText
            id="songName"
            v-model="songName"
            :placeholder="t('guest.whatSong')"
            class="form-input"
            :class="{ 'p-invalid': errors.songName }"
          />
          <small
            v-if="errors.songName"
            class="error-text"
          >{{ errors.songName }}</small>
        </div>

        <div class="form-group">
          <label
            class="form-label"
            for="youtubeLink"
          >
            {{ t('guest.youtubeLink') }} <span class="optional">{{ t('guest.optional') }}</span>
          </label>
          <InputText
            id="youtubeLink"
            v-model="youtubeLink"
            :placeholder="t('guest.youtubePlaceholder')"
            class="form-input"
            :class="{ 'p-invalid': errors.youtubeLink }"
          />
          <small
            v-if="errors.youtubeLink"
            class="error-text"
          >{{ errors.youtubeLink }}</small>
          <small
            v-else
            class="helper-text"
          >
            <i class="pi pi-info-circle" />
            {{ t('guest.youtubeHelper') }}
          </small>
        </div>

        <Button
          type="submit"
          :label="t('guest.submit')"
          icon="pi pi-send"
          class="submit-btn"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </form>
    </template>
  </div>
</template>

<style scoped>
.guest-view {
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

.guest-header {
  text-align: center;
  margin-bottom: 2rem;
}

.room-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-light);
  color: var(--accent-color);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.guest-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.guest-header p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.song-form {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.required {
  color: var(--accent-color);
}

.optional {
  font-weight: 400;
  color: var(--text-muted);
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem !important;
  font-size: 1rem !important;
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-sm) !important;
  color: var(--text-primary) !important;
}

.form-input:focus {
  border-color: var(--accent-color) !important;
  box-shadow: 0 0 0 3px var(--accent-light) !important;
}

.form-input.p-invalid {
  border-color: #ef4444 !important;
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.helper-text {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-muted);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.helper-text i {
  font-size: 0.75rem;
}

.submit-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 1rem 1.5rem !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  background: var(--accent-color) !important;
  border: none !important;
  border-radius: var(--radius-md) !important;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-hover) !important;
}

.submit-btn:disabled {
  opacity: 0.7;
}
</style>
