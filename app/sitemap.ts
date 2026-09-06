import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'
import { getWriteups } from '@/lib/writeups'

// No lastModified on the pages on purpose: the honest value would be the
// build time, which marks every deploy as a content change, and crawlers
// learn to ignore a lastmod that is always "now". A writeup has a real date.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const writeups = await getWriteups()
  return [
    { url: SITE, priority: 1 },
    { url: `${SITE}/certificates`, priority: 0.8 },
    { url: `${SITE}/writeups`, priority: 0.8 },
    ...writeups
      .filter((w) => !w.draft)
      .map((w) => ({ url: `${SITE}/writeups/${w.slug}`, lastModified: w.date, priority: 0.6 })),
  ]
}
