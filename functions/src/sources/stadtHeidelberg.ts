import * as cheerio from 'cheerio'
import type { ScrapedEvent } from '../types.js'

// Scraper for Stadt Heidelberg Veranstaltungskalender list page.
// The page can be filterable; as a fallback, we extract items that contain a date and title links.

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

export async function scrapeStadtHeidelberg(listUrl: string): Promise<ScrapedEvent[]> {
  const res = await fetch(listUrl, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; EventsHD/1.0)' }
  })
  const html = await res.text()
  const $ = cheerio.load(html)

  const events: ScrapedEvent[] = []

  // Try structured items first: look for list/article blocks with links
  $('a').each((_, a) => {
    const text = $(a).text().trim().replace(/\s+/g, ' ')
    const href = $(a).attr('href')
    if (!href) return
    const dateIso = parseGermanDate(text)
    if (!dateIso) return
    const title = text.replace(/^(\d{2}\.\d{2}\.\d{4}[^A-Za-z0-9]*)/, '').trim()
    if (!title) return
    events.push({
      title,
      startDate: dateIso,
      source: 'stadt-heidelberg',
      sourceUrl: absoluteUrl(href, listUrl),
    })
  })

  const unique = new Map<string, ScrapedEvent>()
  for (const e of events) unique.set(e.sourceUrl, e)
  return Array.from(unique.values())
}


