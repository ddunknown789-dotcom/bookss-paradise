import type { MetadataRoute } from 'next'

import { getSetting } from '@/lib/cms/queries'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = (await getSetting<string>('site.url', process.env.NEXT_PUBLIC_SITE_URL ?? '')).replace(/\/$/, '')
  const indexing = await getSetting<boolean>('seo.indexingEnabled', true)

  // The admin is never crawlable, whatever the site-wide setting says.
  const disallow = ['/admin', '/admin/']

  if (!indexing) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow }],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
    host: base || undefined,
  }
}
