<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const props = defineProps<{
  roomId: string
}>()

const router = useRouter()

function addAnotherSong() {
  router.push({ name: 'JoinRoom', params: { roomId: props.roomId } })
}

function goHome() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="submitted-view">
    <div class="success-card">
      <div class="success-icon">
        <i class="pi pi-check" />
      </div>
      
      <h1>You're in the Queue!</h1>
      <p>Your song request has been submitted. The host will see it shortly.</p>
      
      <div class="room-info">
        <span class="room-label">Room</span>
        <span class="room-code">{{ roomId }}</span>
      </div>

      <div class="actions">
        <Button
          label="Add Another Song"
          icon="pi pi-plus"
          class="btn-primary-action"
          @click="addAnotherSong"
        />
        <Button
          label="Done"
          icon="pi pi-home"
          class="btn-secondary-action"
          outlined
          @click="goHome"
        />
      </div>
    </div>

    <div class="tips">
      <h3>
        <i class="pi pi-lightbulb" />
        Tips
      </h3>
      <ul>
        <li>Stay close to hear when it's your turn</li>
        <li>Check with the host if you need to step away</li>
        <li>Have fun and enjoy the show!</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.submitted-view {
  padding-bottom: 2rem;
}

.success-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--success-color), #5fd98f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 12px 32px rgba(45, 138, 78, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-icon i {
  font-size: 2.5rem;
  color: white;
}

.success-card h1 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
}

.success-card p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  max-width: 280px;
  margin: 0 auto 1.5rem;
}

.room-info {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.room-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.room-code {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: var(--accent-color);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-primary-action {
  width: 100%;
  justify-content: center;
  padding: 1rem !important;
  font-weight: 600 !important;
  background: var(--accent-color) !important;
  border: none !important;
  border-radius: var(--radius-md) !important;
}

.btn-primary-action:hover {
  background: var(--accent-hover) !important;
}

.btn-secondary-action {
  width: 100%;
  justify-content: center;
  padding: 1rem !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
  border-radius: var(--radius-md) !important;
}

.btn-secondary-action:hover {
  background: var(--bg-secondary) !important;
}

.tips {
  background: var(--info-light);
  border: 1px solid var(--info-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.tips h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--info-color);
  margin-bottom: 0.75rem;
}

.tips ul {
  margin: 0;
  padding-left: 1.25rem;
}

.tips li {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.tips li:last-child {
  margin-bottom: 0;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

