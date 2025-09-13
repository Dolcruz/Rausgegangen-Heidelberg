import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where, limit, QueryConstraint } from 'firebase/firestore'
import { db } from '../firebase'
import type { EventDoc } from '../types'

export interface UseEventsOptions {
  search?: string
  category?: string
  from?: Date
  to?: Date
  max?: number
}

// Live query upcoming events. We keep server filters simple for reliability and
// do extra filtering client-side for text search and optional category.
export function useEvents(options: UseEventsOptions) {
  const { search, category, from, to, max = 500 } = options
  const [events, setEvents] = useState<EventDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const constraints = useMemo(() => {
    const c: QueryConstraint[] = []
    const now = from ?? new Date()
    c.push(where('startDate', '>=', now.toISOString()))
    c.push(orderBy('startDate', 'asc'))
    if (to) c.push(where('startDate', '<=', to.toISOString()))
    c.push(limit(max))
    return c
  }, [from, to, max])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const ref = collection(db, 'events')
    const q = query(ref, ...constraints)
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as EventDoc[]
        // Client-side filtering by text / category for simplicity.
        const filtered = docs.filter((e) => {
          const matchesText = !search
            ? true
            : [e.title, e.description, e.venue, e.address, e.city]
                .filter(Boolean)
                .some((s) => (s as string).toLowerCase().includes(search!.toLowerCase()))
          const matchesCategory = !category ? true : (e.category || '').toLowerCase() === category.toLowerCase()
          return matchesText && matchesCategory
        })
        setEvents(filtered)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [constraints, search, category])

  return { events, loading, error }
}


