import { db } from './firestore.js'
import { sha1Hex } from './hash.js'
import type { ScrapedEvent } from '../types.js'

// Upsert events by deterministic id derived from sourceUrl to avoid duplicates across runs
export async function upsertEvents(events: ScrapedEvent[]) {
  const batch = db.batch()
  const nowIso = new Date().toISOString()
  for (const e of events) {
    const id = sha1Hex(e.sourceUrl)
    const ref = db.collection('events').doc(id)
    batch.set(
      ref,
      {
        ...e,
        id,
        updatedAt: nowIso,
        createdAt: nowIso,
      },
      { merge: true },
    )
  }
  await batch.commit()
}


