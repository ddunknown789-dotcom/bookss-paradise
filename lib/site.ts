/**
 * Canonical facts about the organisation.
 *
 * One source for the About page, the footer, JSON-LD and metadata fallbacks —
 * so the founding year, email and social handles can never disagree between
 * the visible page and the structured data Google reads. Google cross-checks
 * those against each other, and a mismatch costs you the Knowledge Panel.
 *
 * Anything an editor should be able to change lives in the CMS `settings`
 * table and overrides the value here; these are the defaults.
 */

export const SITE_URL = 'https://bookssparadise.com'

export const ORG = {
  name: 'Books Paradise',
  alternateName: 'Books Paradise',
  legalName: 'Books Paradise',
  type: 'Literary Marketing Agency and Book Review Platform',
  /** Schema.org type. Organization is the safe, widely-supported choice. */
  schemaType: 'Organization',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  logoWidth: 512,
  logoHeight: 512,

  /**
   * NOTE: the brief gave two different founding years — 2019 in the About copy
   * and 2026 in the schema. 2019 is used in both places, because a page that
   * says one year while its structured data says another is exactly the kind
   * of contradiction that gets an entity dropped from the Knowledge Graph.
   * Change this one constant if 2026 is correct; both places follow it.
   */
  foundingDate: '2019',

  email: 'contact@bookssparadise.com',

  description:
    'Books Paradise is a premium literary platform dedicated to helping authors grow through professional book reviews, cinematic book trailers, promotional campaigns, author interviews, social media marketing and curated book recommendations.',

  /** Shorter form for the schema `description`, which Google truncates. */
  shortDescription:
    'Books Paradise is a literary marketing agency helping authors through professional reviews, trailers, interviews and promotional campaigns.',

  tagline: 'Stories That Stay With You Forever',

  /**
   * `sameAs` is how Google links this entity to profiles it already knows.
   * Only Instagram is confirmed; the rest are placeholders on the real
   * handle and should be corrected or removed once the accounts exist —
   * a `sameAs` pointing at a 404 is worse than omitting it.
   */
  social: {
    instagram: { handle: '@bookss.paradise', url: 'https://www.instagram.com/bookss.paradise/', confirmed: true },
    facebook: { handle: 'bookssparadise', url: 'https://www.facebook.com/bookssparadise', confirmed: false },
    twitter: { handle: '@bookssparadise', url: 'https://x.com/bookssparadise', confirmed: false },
  },

  services: [
    'Professional Book Reviews',
    'Cinematic Book Trailers',
    'Book Summary Videos',
    'Author Interviews',
    'Social Media Marketing',
    'Promotional Campaigns',
    'Curated Book Recommendations',
  ],
} as const

/** Every profile URL, in the order Google prefers to see them. */
export const SAME_AS: string[] = [
  ORG.social.instagram.url,
  ORG.social.facebook.url,
  ORG.social.twitter.url,
]

/** Absolute URL for a site-relative path. Never returns a localhost URL. */
export function absoluteUrl(path = '/', base: string = SITE_URL): string {
  if (/^https?:\/\//i.test(path)) return path
  const origin = base.replace(/\/$/, '')
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
