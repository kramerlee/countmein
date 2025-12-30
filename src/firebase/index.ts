import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

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

// Lazy initialization to prevent crashes on load
export function getDb(): Firestore {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set environment variables.')
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
  }

  if (!db) {
    db = getFirestore(app)
  }

  return db
}

// For backwards compatibility, but will throw if not configured
export { db }
