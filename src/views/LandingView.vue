<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoomStore } from '@/stores/roomStore'
import { useAuthStore } from '@/stores/authStore'
import {
  trackLandingView,
  trackLandingCTA,
  trackSectionView,
  trackRoomCreate,
  trackRoomJoin
} from '@/utils/analytics'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const router = useRouter()
const roomStore = useRoomStore()
const authStore = useAuthStore()

const joinRoomId = ref('')
const joinError = ref('')
const isCreating = ref(false)
const isJoining = ref(false)

const isConfigured = computed(() => roomStore.isConfigured)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Track section visibility
const trackedSections = new Set<string>()
let observer: IntersectionObserver | null = null

onMounted(() => {
  // Track landing page view
  trackLandingView()

  // Set up intersection observer for section tracking
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          if (sectionId && !trackedSections.has(sectionId)) {
            trackedSections.add(sectionId)
            const sectionMap: Record<string, 'features' | 'how_it_works' | 'get_started'> = {
              'features': 'features',
              'how-it-works': 'how_it_works',
              'get-started': 'get_started'
            }
            if (sectionMap[sectionId]) {
              trackSectionView(sectionMap[sectionId])
            }
          }
        }
      })
    },
    { threshold: 0.3 }
  )

  // Observe sections
  document.querySelectorAll('section[id]').forEach((section) => {
    observer?.observe(section)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

async function createRoom() {
  // Require authentication to create rooms
  if (!isAuthenticated.value) {
    trackLandingCTA('get_started')
    router.push({ name: 'Login', query: { redirect: '/host' } })
    return
  }

  trackRoomCreate(false) // Track attempt
  try {
    isCreating.value = true
    const room = await roomStore.createRoom(authStore.user?.uid)
    trackRoomCreate(true, room.id) // Track success
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

  trackRoomJoin(false) // Track attempt
  try {
    isJoining.value = true
    const exists = await roomStore.roomExists(roomId)

    if (!exists) {
      joinError.value = t('home.roomNotFound')
      return
    }

    trackRoomJoin(true, roomId) // Track success
    router.push({ name: 'JoinRoom', params: { roomId } })
  } catch {
    joinError.value = t('home.failedCheck')
  } finally {
    isJoining.value = false
  }
}

function scrollToActions() {
  trackLandingCTA('get_started')
  document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })
}

function handleLearnMore() {
  trackLandingCTA('learn_more')
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="landing-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="gradient-orb orb-1" />
        <div class="gradient-orb orb-2" />
        <div class="gradient-orb orb-3" />
      </div>
      
      <div class="hero-content">
        <div class="hero-badge">
          <i class="pi pi-sparkles" />
          <span>{{ t('landing.badge') }}</span>
        </div>
        
        <h1 class="hero-title">
          {{ t('landing.heroTitle') }}
        </h1>
        
        <p class="hero-description">
          {{ t('landing.heroDescription') }}
        </p>
        
        <div class="hero-actions">
          <Button
            :label="t('landing.getStarted')"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="btn-primary-hero"
            @click="scrollToActions"
          />
          <Button
            :label="t('landing.learnMore')"
            icon="pi pi-play"
            class="btn-secondary-hero"
            outlined
            @click="handleLearnMore"
          />
        </div>
        
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">{{ t('landing.statFree') }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-number">
              <i class="pi pi-bolt" />
            </span>
            <span class="stat-label">{{ t('landing.statRealtime') }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-number">
              <i class="pi pi-mobile" />
            </span>
            <span class="stat-label">{{ t('landing.statMobile') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section
      id="features"
      class="features-section"
    >
      <div class="section-header">
        <h2>{{ t('landing.featuresTitle') }}</h2>
        <p>{{ t('landing.featuresSubtitle') }}</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-qrcode" />
          </div>
          <h3>{{ t('landing.feature1Title') }}</h3>
          <p>{{ t('landing.feature1Desc') }}</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-sync" />
          </div>
          <h3>{{ t('landing.feature2Title') }}</h3>
          <p>{{ t('landing.feature2Desc') }}</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-list" />
          </div>
          <h3>{{ t('landing.feature3Title') }}</h3>
          <p>{{ t('landing.feature3Desc') }}</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-youtube" />
          </div>
          <h3>{{ t('landing.feature4Title') }}</h3>
          <p>{{ t('landing.feature4Desc') }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section
      id="how-it-works"
      class="how-it-works-section"
    >
      <div class="section-header">
        <h2>{{ t('landing.howItWorksTitle') }}</h2>
        <p>{{ t('landing.howItWorksSubtitle') }}</p>
      </div>
      
      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>{{ t('landing.step1Title') }}</h3>
            <p>{{ t('landing.step1Desc') }}</p>
          </div>
          <div class="step-icon">
            <i class="pi pi-plus-circle" />
          </div>
        </div>
        
        <div class="step-connector">
          <i class="pi pi-arrow-down" />
        </div>
        
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>{{ t('landing.step2Title') }}</h3>
            <p>{{ t('landing.step2Desc') }}</p>
          </div>
          <div class="step-icon">
            <i class="pi pi-share-alt" />
          </div>
        </div>
        
        <div class="step-connector">
          <i class="pi pi-arrow-down" />
        </div>
        
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>{{ t('landing.step3Title') }}</h3>
            <p>{{ t('landing.step3Desc') }}</p>
          </div>
          <div class="step-icon">
            <i class="pi pi-users" />
          </div>
        </div>
        
        <div class="step-connector">
          <i class="pi pi-arrow-down" />
        </div>
        
        <div class="step-card highlight">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>{{ t('landing.step4Title') }}</h3>
            <p>{{ t('landing.step4Desc') }}</p>
          </div>
          <div class="step-icon">
            <i class="pi pi-microphone" />
          </div>
        </div>
      </div>
    </section>

    <!-- Get Started Section -->
    <section
      id="get-started"
      class="get-started-section"
    >
      <div class="section-header">
        <h2>{{ t('landing.ctaTitle') }}</h2>
        <p>{{ t('landing.ctaSubtitle') }}</p>
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

      <div class="actions-grid">
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
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <i class="pi pi-microphone" />
          <span>Count Me In</span>
        </div>
        <p class="footer-tagline">{{ t('app.tagline') }}</p>
        <div class="footer-links">
          <a
            href="https://github.com/kramerlee/countmein"
            target="_blank"
            rel="noopener"
          >
            <i class="pi pi-github" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing-view {
  min-height: 100vh;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #e85d04, #ff9f5a);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  bottom: -50px;
  left: -50px;
  animation-delay: -7s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #ffd93d, #ff9f5a);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
  opacity: 0.3;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-light);
  color: var(--accent-color);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-badge i {
  font-size: 0.875rem;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.btn-primary-hero {
  background: var(--accent-color) !important;
  border: none !important;
  padding: 1rem 2rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  border-radius: var(--radius-md) !important;
  justify-content: center;
}

.btn-primary-hero:hover {
  background: var(--accent-hover) !important;
  transform: translateY(-2px);
}

.btn-secondary-hero {
  padding: 1rem 2rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  border-radius: var(--radius-md) !important;
  justify-content: center;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-color);
}

.stat-number i {
  font-size: 1.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border-color);
}

/* Features Section */
.features-section {
  padding: 4rem 1rem;
  background: var(--surface-ground);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.section-header p {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.feature-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: var(--accent-light);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.feature-icon i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.feature-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* How It Works Section */
.how-it-works-section {
  padding: 4rem 1rem;
}

.steps-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  width: 100%;
  transition: all 0.3s ease;
}

.step-card.highlight {
  background: linear-gradient(135deg, var(--accent-light), transparent);
  border-color: var(--accent-color);
}

.step-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--accent-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.step-content p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.step-icon {
  width: 40px;
  height: 40px;
  background: var(--surface-ground);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-icon i {
  font-size: 1.25rem;
  color: var(--text-muted);
}

.step-connector {
  display: flex;
  justify-content: center;
  color: var(--text-muted);
  opacity: 0.5;
}

/* Get Started Section */
.get-started-section {
  padding: 4rem 1rem;
  background: var(--surface-ground);
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
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
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

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
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

/* Footer */
.landing-footer {
  padding: 2rem 1rem;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  text-align: center;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.footer-brand i {
  color: var(--accent-color);
}

.footer-tagline {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.footer-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--accent-color);
}

/* Responsive */
@media (min-width: 640px) {
  .hero-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.5rem;
  }
  
  .section-header h2 {
    font-size: 2.5rem;
  }
  
  .step-card {
    padding: 1.5rem;
  }
}
</style>

