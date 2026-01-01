import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/firebase'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isConfigured = computed(() => isFirebaseConfigured)

  // Initialize auth state listener
  function initAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (!isFirebaseConfigured) {
        isLoading.value = false
        isInitialized.value = true
        resolve()
        return
      }

      const auth = getFirebaseAuth()
      onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          }
        } else {
          user.value = null
        }
        isLoading.value = false
        isInitialized.value = true
        resolve()
      })
    })
  }

  async function register(email: string, password: string, displayName: string): Promise<boolean> {
    if (!isFirebaseConfigured) {
      error.value = 'Firebase is not configured'
      return false
    }

    try {
      isLoading.value = true
      error.value = null

      const auth = getFirebaseAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update display name
      await updateProfile(userCredential.user, { displayName })

      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName
      }

      return true
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          error.value = 'Email is already registered'
          break
        case 'auth/invalid-email':
          error.value = 'Invalid email address'
          break
        case 'auth/weak-password':
          error.value = 'Password is too weak (min 6 characters)'
          break
        default:
          error.value = firebaseError.message || 'Registration failed'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    if (!isFirebaseConfigured) {
      error.value = 'Firebase is not configured'
      return false
    }

    try {
      isLoading.value = true
      error.value = null

      const auth = getFirebaseAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      }

      return true
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          error.value = 'Invalid email or password'
          break
        case 'auth/invalid-email':
          error.value = 'Invalid email address'
          break
        case 'auth/too-many-requests':
          error.value = 'Too many attempts. Please try again later'
          break
        default:
          error.value = firebaseError.message || 'Login failed'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    if (!isFirebaseConfigured) return

    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
      user.value = null
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    isLoading,
    error,
    isInitialized,
    isAuthenticated,
    isConfigured,
    initAuth,
    register,
    login,
    logout,
    clearError
  }
})

