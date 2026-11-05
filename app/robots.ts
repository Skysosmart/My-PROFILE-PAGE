import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    // the Disallow is the easter egg's front door (see app/duck-pond)
    rules: { userAgent: '*', allow: '/', disallow: '/duck-pond' },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
