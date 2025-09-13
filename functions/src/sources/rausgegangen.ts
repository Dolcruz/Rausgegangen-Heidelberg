import * as cheerio from 'cheerio'
import type { ScrapedEvent } from '../types.js'

// Scraper for Rausgegangen Heidelberg overview page.
// The site may be highly dynamic; we attempt to extract anchor items with event detail links
// and parse adjacent date strings.

function absoluteUrl(href: string, base: string): string {
  try { return new URL(href, base).toString() } catch { return href }
}

function parseGermanDate(input: string): string | undefined {
  // date like 14.09.2025 or 14.09.2025 20:00
  const m = input.match(/(\d{2})\.(\d{2})\.(\d{4})(?:[^0-9]{1,5}([0-2]\d:[0-5]\d))?/)
  if (!m) return undefined
  const [_, dd, mm, yyyy, hhmm] = m
  const iso = `${yyyy}-${mm}-${dd}${hhmm ? `T${hhmm}:00` : 'T00:00:00'}`
  return new Date(iso).toISOString()
}

export async function scrapeRausgegangen(listUrl: string): Promise<ScrapedEvent[]> {
  const res = await fetch(listUrl, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; EventsHD/1.0)' } })
  const html = await res.text()
  const $ = cheerio.load(html)

  const events: ScrapedEvent[] = []

  $('a').each((_, a) => {
    const href = $(a).attr('href')
    const title = $(a).text().trim().replace(/\s+/g, ' ')
    if (!href || !title) return
    // consider only links that look like event detail
    if (!/rausgegangen\.de\/.+/.test(absoluteUrl(href, listUrl))) return
    const containerText = $(a).closest('article, li, div').text().trim().replace(/\s+/g, ' ')
    const dateIso = parseGermanDate(containerText)
    if (!dateIso) return
    events.push({
      title,
      startDate: dateIso,
      source: 'rausgegangen',
      sourceUrl: absoluteUrl(href, listUrl),
    })
  })

  const unique = new Map<string, ScrapedEvent>()
  for (const e of events) unique.set(e.sourceUrl, e)
  return Array.from(unique.values())
}


