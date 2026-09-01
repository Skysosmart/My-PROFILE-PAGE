import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// No lastModified on purpose: the honest value would be the build time,
// which marks every deploy as a content change, and crawlers learn to
// ignore a lastmod that is always "now".
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, priority: 1 },
    { url: `${SITE}/certificates`, priority: 0.8 },
  ]
}
