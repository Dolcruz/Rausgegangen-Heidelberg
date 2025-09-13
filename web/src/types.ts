// Shared types for the web app

export type EventSource = 'heidelberg-marketing' | 'stadt-heidelberg' | 'ekihd' | 'rausgegangen'

export interface EventDoc {
  id: string
  title: string
  description?: string
  startDate: string // ISO string
  endDate?: string // ISO string
  venue?: string
  address?: string
  city?: string
  imageUrl?: string
  price?: string
  category?: string
  source: EventSource
  sourceUrl: string
  createdAt?: string
  updatedAt?: string
}


