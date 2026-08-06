import type { MetadataRoute } from 'next'

import { getBookSlugs, getInterviews, getSetting } from '@/lib/cms/queries'

/**
 * Built from published content, so a book that goes live is in the sitemap on
 * the next request — nothing to regenerate by hand.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (await getSetting<string>('site.url', process.env.NEXT_PUBLIC_SITE_URL ?? '')).replace(/\/$/, '')
  if (!base) return []

  const [books, interviews] = await Promise.all([getBookSlugs(), getInterviews(200)])
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/books`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/books-of-the-week`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const bookPages: MetadataRoute.Sitemap = books.flatMap((b) => [
    { url: `${base}/books/${b.slug}`, lastModified: new Date(b.updated_at), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/books/${b.slug}/review`, lastModified: new Date(b.updated_at), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${base}/books/${b.slug}/summary`, lastModified: new Date(b.updated_at), changeFrequency: 'monthly' as const, priority: 0.6 },
  ])

  const interviewPages: MetadataRoute.Sitemap = interviews.map((i) => ({
    url: `${base}/interviews/${i.slug}`,
    lastModified: i.iso ? new Date(i.iso) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...bookPages, ...interviewPages]
}
