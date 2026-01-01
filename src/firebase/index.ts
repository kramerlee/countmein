import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Check if Firebase is configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
)

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

// Get Firebase app instance (lazy initialization)
export function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set environment variables.')
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
  }

  return app
}

// Lazy initialization to prevent crashes on load
export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp())
  }
  return db
}

// Get Firebase Auth instance
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getApp())
  }
  return auth
}

// For backwards compatibility
export { db, auth }
