import { onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { logger, setGlobalOptions } from 'firebase-functions/v2'
import { upsertEvents } from './lib/saveEvents.js'
import { scrapeHeidelbergMarketing } from './sources/heidelbergMarketing.js'
import { scrapeStadtHeidelberg } from './sources/stadtHeidelberg.js'
import { scrapeEKIHD } from './sources/ekihd.js'
import { scrapeRausgegangen } from './sources/rausgegangen.js'

setGlobalOptions({ region: 'europe-west3', cpu: 1, memory: '256MiB', maxInstances: 5 })

// Default date window: next 90 days
function defaultListUrls() {
  const today = new Date()
  const to = new Date(today)
  to.setDate(to.getDate() + 90)

  const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10)

  const heidelbergMarketingUrl = `https://www.heidelberg-marketing.de/events/ergebnisliste-1?tx_ndssearch_search%5Baction%5D=search&tx_ndssearch_search%5Bcontroller%5D=Search&tx_ndssearch_search%5BpresetSearchParams%5D%5Bcategory%5D=0&tx_ndssearch_search%5BpresetSearchParams%5D%5Bfrom%5D=${yyyyMmDd(today)}&tx_ndssearch_search%5BpresetSearchParams%5D%5Bto%5D=${yyyyMmDd(to)}`
  const stadtHeidelbergUrl = 'https://www.heidelberg.de/HD/Leben/veranstaltungskalender.html'
  const ekihdUrl = 'https://ekihd.de/kalender/alle-veranstaltungen/'
  const rausgegangenUrl = 'https://rausgegangen.de/heidelberg/'
  return { heidelbergMarketingUrl, stadtHeidelbergUrl, ekihdUrl, rausgegangenUrl }
}

async function scrapeAll() {
  const { heidelbergMarketingUrl, stadtHeidelbergUrl, ekihdUrl, rausgegangenUrl } = defaultListUrls()
  logger.info('Scraping sources', { heidelbergMarketingUrl, stadtHeidelbergUrl, ekihdUrl, rausgegangenUrl })

  const [a, b, c, d] = await Promise.allSettled([
    scrapeHeidelbergMarketing(heidelbergMarketingUrl),
    scrapeStadtHeidelberg(stadtHeidelbergUrl),
    scrapeEKIHD(ekihdUrl),
    scrapeRausgegangen(rausgegangenUrl),
  ])

  const collected = [a, b, c, d]
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  logger.info(`Collected ${collected.length} events from all sources`)
  await upsertEvents(collected)
  return collected.length
}

export const scrapeNow = onRequest({ cors: true, invoker: 'public' }, async (_req, res) => {
  try {
    const count = await scrapeAll()
    res.json({ ok: true, saved: count })
  } catch (err: any) {
    logger.error('Scrape failed', err)
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// Run every day at 04:00 Europe/Berlin
export const scrapeDaily = onSchedule({ schedule: '0 4 * * *', timeZone: 'Europe/Berlin' }, async () => {
  await scrapeAll()
})


