import * as cheerio from 'cheerio'
import type { ScrapedEvent } from '../types.js'

// Scraper for Evangelische Kirche Heidelberg calendar page.
// We parse date lines like "So. 14.09.2025, 10:00 Uhr" followed by a title link.

function absoluteUrl(href: string, base: string): string {
  try { return new URL(href, base).toString() } catch { return href }
}

function parseGermanDate(input: string): string | undefined {
  const m = input.match(/(\d{2})\.(\d{2})\.(\d{4})(?:[^0-9]{1,5}([0-2]\d:[0-5]\d))?/)
  if (!m) return undefined
  const [_, dd, mm, yyyy, hhmm] = m
  const iso = `${yyyy}-${mm}-${dd}${hhmm ? `T${hhmm}:00` : 'T00:00:00'}`
  return new Date(iso).toISOString()
}

export async function scrapeEKIHD(listUrl: string): Promise<ScrapedEvent[]> {
  const res = await fetch(listUrl, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; EventsHD/1.0)' } })
  const html = await res.text()
  const $ = cheerio.load(html)

  const events: ScrapedEvent[] = []

  // Each event is commonly structured with a date line and nearby title link
  $('a').each((_, el) => {
    const href = $(el).attr('href')
    const title = $(el).text().trim()
    if (!href || !title) return
    const containerText = $(el).closest('article, li, div').text().trim().replace(/\s+/g, ' ')
    const dateIso = parseGermanDate(containerText)
    if (!dateIso) return
    events.push({
      title,
      startDate: dateIso,
      source: 'ekihd',
      sourceUrl: absoluteUrl(href, listUrl),
    })
  })

  const unique = new Map<string, ScrapedEvent>()
  for (const e of events) unique.set(e.sourceUrl, e)
  return Array.from(unique.values())
}


