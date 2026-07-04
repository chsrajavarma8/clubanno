import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { isSupported, getAnalytics } from 'firebase/analytics'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const CLUB_AUTH_DOMAIN = import.meta.env.VITE_CLUB_AUTH_DOMAIN || 'communityhub.local'

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics only works in a real browser (not during emulator/local-dev
// scripts run from Node, and not in every browser — e.g. Safari private
// mode blocks it), so it's initialized lazily and never blocks app startup.
export let analytics = null
if (import.meta.env.VITE_USE_EMULATORS !== 'true' && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app)
    })
    .catch(() => {})
}

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectStorageEmulator(storage, '127.0.0.1', 9199)
}
