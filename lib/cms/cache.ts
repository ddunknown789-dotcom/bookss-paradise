import 'server-only'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Cache tags.
 *
 * Public pages are statically rendered and tagged; every admin mutation calls
 * `revalidate(...)` with the tags it touched. That is what makes "click Save,
 * see it live" true without turning the whole site dynamic.
 */
export const TAGS = {
  books: 'books',
  book: (slug: string) => `book:${slug}`,
  authors: 'authors',
  reviews: 'reviews',
  interviews: 'interviews',
  interview: (slug: string) => `interview:${slug}`,
  weeks: 'weeks',
  videos: 'videos',
  services: 'services',
  categories: 'categories',
  media: 'media',
  page: (slug: string) => `page:${slug}`,
  sections: 'sections',
  menus: 'menus',
  social: 'social',
  seo: 'seo',
  settings: 'settings',
} as const

/** Everything the public site reads. Used on structural changes. */
export const ALL_CONTENT_TAGS = [
  TAGS.books,
  TAGS.authors,
  TAGS.reviews,
  TAGS.interviews,
  TAGS.weeks,
  TAGS.videos,
  TAGS.services,
  TAGS.categories,
  TAGS.sections,
  TAGS.menus,
  TAGS.social,
  TAGS.seo,
  TAGS.settings,
]

/**
 * Invalidate one or more tags and, for good measure, the routes that can't be
 * expressed as a tag (the sitemap). Safe to over-call — revalidation is cheap
 * next to a stale page a client can see.
 */
export function revalidate(...tags: string[]): void {
  for (const tag of tags) revalidateTag(tag)
  revalidatePath('/sitemap.xml')
}

export function revalidateEverything(): void {
  revalidate(...ALL_CONTENT_TAGS)
  revalidatePath('/', 'layout')
}
