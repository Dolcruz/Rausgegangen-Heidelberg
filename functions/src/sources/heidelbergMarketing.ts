import * as cheerio from 'cheerio'
import type { ScrapedEvent } from '../types.js'

// Scraper for Heidelberg Marketing event search result list.
// Example list URL (date-window can be adjusted by caller):
// https://www.heidelberg-marketing.de/events/ergebnisliste-1?... 
// We parse anchor entries that contain a date like 13.09.2025 and extract title + link.

function absoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString()
  } catch {
    return href
  }
}

function parseGermanDate(input: string): string | undefined {
  // Finds dd.mm.yyyy and optional time hh:mm in a string
  const m = input.match(/(\d{2})\.(\d{2})\.(\d{4})(?:[^0-9]{1,5}([0-2]\d:[0-5]\d))?/)
  if (!m) return undefined
  const [_, dd, mm, yyyy, hhmm] = m
  const iso = `${yyyy}-${mm}-${dd}${hhmm ? `T${hhmm}:00` : 'T00:00:00'}`
  return new Date(iso).toISOString()
}

export async function scrapeHeidelbergMarketing(listUrl: string): Promise<ScrapedEvent[]> {
  const res = await fetch(listUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; EventsHD/1.0; +https://example.com)'
    }
  })
  const html = await res.text()
  const $ = cheerio.load(html)

  const events: ScrapedEvent[] = []

  // Generic approach: look for links in the main content area that contain a date pattern
  $('main a, .content a, a').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ')
    const href = $(el).attr('href')
    if (!href) return
    const dateIso = parseGermanDate(text)
    if (!dateIso) return

    const title = text.replace(/^(\d{2}\.\d{2}\.\d{4}[^A-Za-z0-9]*)/, '').trim()
    const url = absoluteUrl(href, listUrl)
    if (!title) return
    events.push({
      title,
      startDate: dateIso,
      source: 'heidelberg-marketing',
      sourceUrl: url,
    })
  })

  // De-duplicate by URL
  const unique = new Map<string, ScrapedEvent>()
  for (const e of events) unique.set(e.sourceUrl, e)
  return Array.from(unique.values())
}


