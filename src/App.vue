<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Toast from 'primevue/toast'
import { setLocale, type Locale } from './i18n'
import { trackLanguageSwitch, trackThemeToggle } from '@/utils/analytics'
import { useAuthStore } from '@/stores/authStore'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isDarkMode = ref(false)
const showUserMenu = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

onMounted(async () => {
  await authStore.initAuth()
})

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
  trackThemeToggle(isDarkMode.value ? 'dark' : 'light')
}

function toggleLocale() {
  const newLocale: Locale = locale.value === 'vi' ? 'en' : 'vi'
  setLocale(newLocale)
  trackLanguageSwitch(newLocale)
}

function goToLogin() {
  router.push({ name: 'Login' })
}

function goToDashboard() {
  router.push({ name: 'Dashboard' })
}

async function handleLogout() {
  await authStore.logout()
  showUserMenu.value = false
  router.push({ name: 'Home' })
}
</script>

<template>
  <div
    class="app-container"
    :class="{ 'dark-mode': isDarkMode }"
  >
    <header class="app-header">
      <router-link
        to="/"
        class="logo"
      >
        <i class="pi pi-microphone" />
        <span>{{ t('app.name') }}</span>
      </router-link>
      <div class="header-actions">
        <button
          class="locale-toggle"
          @click="toggleLocale"
        >
          {{ locale === 'vi' ? 'EN' : 'VI' }}
        </button>
        <button
          class="theme-toggle"
          @click="toggleDarkMode"
        >
          <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" />
        </button>

        <!-- Auth Section -->
        <template v-if="isAuthenticated">
          <div class="user-menu-wrapper">
            <button
              class="user-btn"
              @click="showUserMenu = !showUserMenu"
            >
              <i class="pi pi-user" />
              <span class="user-name">{{ user?.displayName || 'User' }}</span>
              <i class="pi pi-chevron-down" />
            </button>
            <div
              v-if="showUserMenu"
              class="user-dropdown"
            >
              <button
                class="dropdown-item"
                @click="goToDashboard(); showUserMenu = false"
              >
                <i class="pi pi-th-large" />
                {{ t('dashboard.yourRooms') }}
              </button>
              <button
                class="dropdown-item logout"
                @click="handleLogout"
              >
                <i class="pi pi-sign-out" />
                {{ t('auth.logout') }}
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <button
            class="login-btn"
            @click="goToLogin"
          >
            <i class="pi pi-sign-in" />
            <span>{{ t('auth.login') }}</span>
          </button>
        </template>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Toast position="top-center" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.logo i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.locale-toggle {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.locale-toggle:hover {
  background: var(--accent-light);
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.theme-toggle {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.theme-toggle:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* Auth Buttons */
.login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-color);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: var(--accent-hover);
}

.user-menu-wrapper {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-btn:hover {
  border-color: var(--accent-color);
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  z-index: 200;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.logout {
  color: #ef4444;
  border-top: 1px solid var(--border-color);
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 480px) {
  .user-name {
    display: none;
  }

  .login-btn span {
    display: none;
  }

  .login-btn {
    padding: 0.5rem;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    justify-content: center;
  }
}

.app-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
