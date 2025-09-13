export type EventSource = 'heidelberg-marketing' | 'stadt-heidelberg' | 'ekihd' | 'rausgegangen'

export interface ScrapedEvent {
  title: string
  description?: string
  startDate: string // ISO
  endDate?: string // ISO
  venue?: string
  address?: string
  city?: string
  imageUrl?: string
  price?: string
  category?: string
  source: EventSource
  sourceUrl: string
}


