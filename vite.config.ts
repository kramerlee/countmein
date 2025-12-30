import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => ({
  // For GitHub Pages: set base to repo name (e.g., '/countmein/')
  // For custom domain or local dev: use '/'
  base: command === 'build' ? process.env.VITE_BASE_URL || '/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173
  }
}))
