<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)

const isValid = computed(() => {
  return email.value.includes('@') && password.value.length >= 6
})

async function handleLogin() {
  if (!isValid.value) return

  isSubmitting.value = true
  const success = await authStore.login(email.value, password.value)
  isSubmitting.value = false

  if (success) {
    router.push({ name: 'Dashboard' })
  }
}

function goToRegister() {
  authStore.clearError()
  router.push({ name: 'Register' })
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>{{ t('auth.login') }}</h1>
        <p>{{ t('auth.loginSubtitle') }}</p>
      </div>

      <form
        class="auth-form"
        @submit.prevent="handleLogin"
      >
        <div class="form-group">
          <label for="email">{{ t('auth.email') }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            class="w-full"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">{{ t('auth.password') }}</label>
          <InputText
            id="password"
            v-model="password"
            type="password"
            :placeholder="t('auth.passwordPlaceholder')"
            class="w-full"
            autocomplete="current-password"
          />
        </div>

        <div
          v-if="authStore.error"
          class="error-message"
        >
          <i class="pi pi-exclamation-circle" />
          {{ authStore.error }}
        </div>

        <Button
          type="submit"
          :label="isSubmitting ? t('common.loading') : t('auth.login')"
          :disabled="!isValid || isSubmitting"
          :loading="isSubmitting"
          class="submit-btn"
        />
      </form>

      <div class="auth-footer">
        <p>
          {{ t('auth.noAccount') }}
          <button
            type="button"
            class="link-btn"
            @click="goToRegister"
          >
            {{ t('auth.register') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group :deep(input) {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.form-group :deep(input:focus) {
  border-color: var(--accent-color);
  outline: none;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: 0.875rem;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  background: var(--accent-color) !important;
  border: none !important;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-hover) !important;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.auth-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.link-btn:hover {
  text-decoration: underline;
}

.w-full {
  width: 100%;
}
</style>

