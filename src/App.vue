<script setup lang="ts">
import { ref } from 'vue'
import Toast from 'primevue/toast'

const isDarkMode = ref(false)

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
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
        <span>Count Me In</span>
      </router-link>
      <button
        class="theme-toggle"
        @click="toggleDarkMode"
      >
        <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" />
      </button>
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
