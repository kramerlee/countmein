<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import type { SongRequest } from '@/types'

const props = defineProps<{
  request: SongRequest
  position?: number
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update-status', status: SongRequest['status']): void
  (e: 'remove'): void
}>()

const { t } = useI18n()

const statusLabel = computed(() => {
  switch (props.request.status) {
    case 'next': return t('queue.upNext')
    case 'ongoing': return t('queue.nowSinging')
    case 'completed': return t('queue.completed')
    default: return t('queue.pending')
  }
})

const youtubeId = computed(() => {
  if (!props.request.youtubeLink) return null
  const match = props.request.youtubeLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : null
})

function openYoutubeLink() {
  if (props.request.youtubeLink) {
    window.open(props.request.youtubeLink, '_blank')
  }
}
</script>

<template>
  <div
    class="queue-item"
    :class="[`status-${request.status}`]"
  >
    <div class="item-header">
      <div
        v-if="position && request.status === 'pending'"
        class="position"
      >
        {{ position }}
      </div>
      <div
        v-else
        class="status-indicator"
      >
        <i
          :class="{
            'pi pi-play-circle': request.status === 'ongoing',
            'pi pi-forward': request.status === 'next',
            'pi pi-check-circle': request.status === 'completed',
            'pi pi-clock': request.status === 'pending'
          }"
        />
      </div>

      <div class="item-content">
        <div class="song-name">
          {{ request.songName }}
        </div>
        <div class="guest-info">
          <i class="pi pi-user" />
          <span>{{ request.guestName }}</span>
        </div>
      </div>

      <span
        class="status-badge"
        :class="`badge-${request.status}`"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div
      v-if="youtubeId"
      class="youtube-preview"
      @click="openYoutubeLink"
    >
      <img
        :src="`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`"
        :alt="request.songName"
        class="youtube-thumb"
      >
      <div class="youtube-overlay">
        <i class="pi pi-youtube" />
      </div>
    </div>

    <div
      v-if="!readonly"
      class="item-actions"
    >
      <template v-if="request.status === 'pending'">
        <Button
          :label="t('queue.next')"
          icon="pi pi-forward"
          size="small"
          class="action-btn next"
          @click="emit('update-status', 'next')"
        />
        <Button
          :label="t('queue.start')"
          icon="pi pi-play"
          size="small"
          class="action-btn start"
          @click="emit('update-status', 'ongoing')"
        />
      </template>

      <template v-else-if="request.status === 'next'">
        <Button
          :label="t('queue.startSinging')"
          icon="pi pi-play"
          size="small"
          class="action-btn start wide"
          @click="emit('update-status', 'ongoing')"
        />
      </template>

      <template v-else-if="request.status === 'ongoing'">
        <Button
          :label="t('queue.complete')"
          icon="pi pi-check"
          size="small"
          class="action-btn complete wide"
          @click="emit('update-status', 'completed')"
        />
      </template>

      <Button
        icon="pi pi-trash"
        size="small"
        class="action-btn remove"
        severity="secondary"
        text
        @click="emit('remove')"
      />
    </div>
  </div>
</template>

<style scoped>
.queue-item {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  transition: all 0.2s ease;
}

.queue-item:hover {
  box-shadow: var(--shadow-sm);
}

.queue-item.status-ongoing {
  border-color: var(--warning-color);
  background: linear-gradient(135deg, var(--surface-elevated) 0%, var(--warning-light) 100%);
}

.queue-item.status-next {
  border-color: var(--info-color);
  background: linear-gradient(135deg, var(--surface-elevated) 0%, var(--info-light) 100%);
}

.queue-item.status-completed {
  opacity: 0.7;
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.position {
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.status-indicator {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-indicator i {
  font-size: 1.25rem;
}

.status-ongoing .status-indicator i {
  color: var(--warning-color);
  animation: pulse 1.5s infinite;
}

.status-next .status-indicator i {
  color: var(--info-color);
}

.status-completed .status-indicator i {
  color: var(--success-color);
}

.status-pending .status-indicator i {
  color: var(--text-muted);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.guest-info i {
  font-size: 0.75rem;
}

.status-badge {
  padding: 0.25rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-pending {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.badge-next {
  background: var(--info-color);
  color: white;
}

.badge-ongoing {
  background: var(--warning-color);
  color: white;
}

.badge-completed {
  background: var(--success-color);
  color: white;
}

.youtube-preview {
  position: relative;
  margin: 0.75rem 0 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  max-height: 120px;
}

.youtube-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.youtube-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.youtube-preview:hover .youtube-overlay {
  opacity: 1;
}

.youtube-overlay i {
  font-size: 2rem;
  color: #ff0000;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  flex: 1;
  justify-content: center;
  font-weight: 600 !important;
  border-radius: var(--radius-sm) !important;
}

.action-btn.wide {
  flex: 2;
}

.action-btn.next {
  background: var(--info-light) !important;
  color: var(--info-color) !important;
  border: none !important;
}

.action-btn.next:hover {
  background: var(--info-color) !important;
  color: white !important;
}

.action-btn.start {
  background: var(--warning-light) !important;
  color: var(--warning-color) !important;
  border: none !important;
}

.action-btn.start:hover {
  background: var(--warning-color) !important;
  color: white !important;
}

.action-btn.complete {
  background: var(--success-light) !important;
  color: var(--success-color) !important;
  border: none !important;
}

.action-btn.complete:hover {
  background: var(--success-color) !important;
  color: white !important;
}

.action-btn.remove {
  flex: 0;
  color: var(--text-muted) !important;
}

.action-btn.remove:hover {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
