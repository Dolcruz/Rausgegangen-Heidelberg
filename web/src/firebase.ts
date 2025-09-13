// Firebase client initialization for the web app.
// Reads config from Vite env vars (prefixed with VITE_*) so nothing secret is hardcoded.
// Explanation: We use the client SDK here only for reading events from Firestore.
// Data is written by Cloud Functions to keep scraping/server work off the client.

import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase app once per page load
export const app = initializeApp(firebaseConfig)

// Export Firestore instance for reads
export const db = getFirestore(app)


