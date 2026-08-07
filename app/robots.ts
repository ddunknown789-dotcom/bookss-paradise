import type { MetadataRoute } from 'next'

import { getSetting } from '@/lib/cms/queries'
import { SITE_URL } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const configured = (await getSetting<string>('site.url', '')).replace(/\/$/, '')
  const base = /^https:\/\//i.test(configured) && !/localhost|127\.0\.0\.1/.test(configured) ? configured : SITE_URL
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
