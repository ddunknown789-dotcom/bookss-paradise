import type { MetadataRoute } from 'next'

import { getSetting } from '@/lib/cms/queries'
import { canonicalOrigin } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = canonicalOrigin(await getSetting<string>('site.url', ''))
  const indexing = await getSetting<boolean>('seo.indexingEnabled', true)

  // The admin is never crawlable, whatever the site-wide setting says.
  const disallow = ['/admin', '/admin/', '/books?q=']

  if (!indexing) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
