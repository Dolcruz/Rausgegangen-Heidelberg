import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Admin SDK once (Cloud Functions runtime keeps it warm between invocations)
if (getApps().length === 0) {
  initializeApp()
}

export const db = getFirestore()


