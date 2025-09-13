// Simple smoke test to verify that scrapers fetch and parse events.
// This does NOT write to Firestore and can be run locally.

import { scrapeHeidelbergMarketing } from './sources/heidelbergMarketing.js'
import { scrapeStadtHeidelberg } from './sources/stadtHeidelberg.js'
import { scrapeEKIHD } from './sources/ekihd.js'
import { scrapeRausgegangen } from './sources/rausgegangen.js'

function defaultListUrls() {
  const today = new Date()
  const to = new Date(today)
  to.setDate(to.getDate() + 30)
  const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10)
  const heidelbergMarketingUrl = `https://www.heidelberg-marketing.de/events/ergebnisliste-1?tx_ndssearch_search%5Baction%5D=search&tx_ndssearch_search%5Bcontroller%5D=Search&tx_ndssearch_search%5BpresetSearchParams%5D%5Bcategory%5D=0&tx_ndssearch_search%5BpresetSearchParams%5D%5Bfrom%5D=${yyyyMmDd(today)}&tx_ndssearch_search%5BpresetSearchParams%5D%5Bto%5D=${yyyyMmDd(to)}`
  const stadtHeidelbergUrl = 'https://www.heidelberg.de/HD/Leben/veranstaltungskalender.html'
  const ekihdUrl = 'https://ekihd.de/kalender/alle-veranstaltungen/'
  const rausgegangenUrl = 'https://rausgegangen.de/heidelberg/'
  return { heidelbergMarketingUrl, stadtHeidelbergUrl, ekihdUrl, rausgegangenUrl }
}

async function main() {
  try {
    const { heidelbergMarketingUrl, stadtHeidelbergUrl, ekihdUrl, rausgegangenUrl } = defaultListUrls()
    const results = await Promise.allSettled([
      scrapeHeidelbergMarketing(heidelbergMarketingUrl),
      scrapeStadtHeidelberg(stadtHeidelbergUrl),
      scrapeEKIHD(ekihdUrl),
      scrapeRausgegangen(rausgegangenUrl),
    ])
    const names = ['heidelberg-marketing', 'stadt-heidelberg', 'ekihd', 'rausgegangen']
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        console.log(`${names[i]}: ${r.value.length} events`)
      } else {
        console.warn(`${names[i]}: failed ->`, r.reason?.message || r.reason)
      }
    })
  } catch (err) {
    console.error('Smoke test failed:', err)
    process.exitCode = 1
  }
}

await main()


