/**
 * Homepage section content shapes.
 *
 * `page_sections.content` is jsonb so a section can gain a field without a
 * migration. These types are the contract between the admin editor and the
 * renderer: every section has a schema here, a form field list, and a
 * `defaults` object used when a field has never been filled in.
 *
 * TO ADD A FIELD: add it to the interface, add it to `defaults`, add a control
 * to the matching admin form. Existing rows keep working — the reader falls
 * back to the default.
 */

import type { SectionType } from '@/lib/supabase/database.types'

export type CtaLink = { label: string; href: string }

export interface IntroContent {
  enabled: boolean
  cueLabel: string
}

export interface HeroContent {
  headingLines: string[]
  subheading: string
  primaryCta: CtaLink
  secondaryCta: CtaLink
  dividerWidth: number
  showArt: boolean
}

export interface VideosContent {
  kicker: string
  heading: string
  subheading: string
}

export interface TopPicksContent {
  heading: string
  cta: CtaLink
  limit: number
  shelfImage: string
}

export interface ReviewsContent {
  heading: string
  cta: CtaLink
  limit: number
  readMoreLabel: string
}

export interface BookOfWeekContent {
  heading: string
  subheading: string
  cta: CtaLink
}

export interface InterviewsContent {
  heading: string
  subheading: string
  cta: CtaLink
  limit: number
}

export interface MissionStat {
  target: number
  suffix: string
  label: string
}

export interface MissionContent {
  heading: string
  body: string
  image: string
  imageAlt: string
  stats: MissionStat[]
}

export interface CommunityContent {
  headingLines: string[]
  body: string
  cta: CtaLink
  image: string
  imageAlt: string
}

export interface OfferContent {
  kicker: string
  heading: string
  subheadingLines: string[]
  footerText: string
}

export interface NewsletterContent {
  heading: string
  body: string
  placeholder: string
  submitLabel: string
  successLabel: string
  image: string
  imageAlt: string
}

export interface SectionContentMap {
  intro: IntroContent
  hero: HeroContent
  videos: VideosContent
  top_picks: TopPicksContent
  reviews: ReviewsContent
  book_of_week: BookOfWeekContent
  interviews: InterviewsContent
  mission: MissionContent
  community: CommunityContent
  offer: OfferContent
  newsletter: NewsletterContent
}

/**
 * Fallbacks. These are the exact strings the site shipped with, so a section
 * whose row is missing or whose field was cleared still renders identically
 * instead of collapsing to an empty box.
 */
export const SECTION_DEFAULTS: SectionContentMap = {
  intro: { enabled: true, cueLabel: 'Scroll' },

  hero: {
    headingLines: ['Stories That Stay', 'With You Forever'],
    subheading:
      'Dive into handpicked books, cinematic trailers, honest reviews, and a community that lives for stories.',
    primaryCta: { label: 'Explore Now', href: '#books' },
    secondaryCta: { label: 'Learn More', href: '#about' },
    dividerWidth: 430,
    showArt: true,
  },

  videos: {
    kicker: 'Explore Our Video Content',
    heading: 'Stories Brought to Life',
    subheading: 'Dive deeper into the books you love through our immersive video content.',
  },

  top_picks: {
    heading: 'Top Picks for You',
    cta: { label: 'View All Books', href: '/books' },
    limit: 12,
    shelfImage: '/assets/shelf.png',
  },

  reviews: {
    heading: 'Latest Book Reviews',
    cta: { label: 'Read More Reviews', href: '#reviews' },
    limit: 6,
    readMoreLabel: 'Read Full Review',
  },

  book_of_week: {
    heading: 'Book of the Week',
    subheading: 'Handpicked stories that stay with you long after the last page.',
    cta: { label: 'See Every Week', href: '/books-of-the-week' },
  },

  interviews: {
    heading: 'Author Interviews',
    subheading: 'Conversations with the writers behind the books you love.',
    cta: { label: 'View All Interviews', href: '#interviews' },
    limit: 4,
  },

  mission: {
    heading: 'Our Mission',
    body:
      'Books Paradise is more than just a page – it’s a paradise for readers. Our mission is to connect people with stories that inspire, heal, and transform.',
    image: '/assets/model/model-mission.png',
    imageAlt: 'Reader sitting beside stacks of classic books',
    stats: [
      { target: 10, suffix: 'K+', label: 'Happy Readers' },
      { target: 500, suffix: '+', label: 'Books Featured' },
      { target: 100, suffix: '+', label: 'Authors Spotlighted' },
    ],
  },

  community: {
    headingLines: ['A Community', 'That Reads', 'Together'],
    body: 'Join thousands of book lovers who share recommendations, thoughts, and love for stories.',
    cta: { label: 'Join Our Community', href: '#newsletter' },
    image: '/assets/model/model-community.png',
    imageAlt: 'Gold-framed portraits of readers arranged on a circular podium',
  },

  offer: {
    kicker: 'Explore Our Services',
    heading: 'What We Offer',
    subheadingLines: ['Premium book promotion and content services', 'designed to bring stories to life.'],
    footerText: 'Stories connect. We make them unforgettable.',
  },

  newsletter: {
    heading: 'Stay in the Loop',
    body: 'Get the latest book updates, trailers, reviews, and recommendations straight to your inbox.',
    placeholder: 'Your email address',
    submitLabel: 'Subscribe',
    successLabel: 'Subscribed ✓',
    image: '/assets/model/model-news.png',
    imageAlt: 'Reader writing with a quill at a desk while a green envelope floats above',
  },
}

/** Admin-facing labels for the section list. */
export const SECTION_LABELS: Record<SectionType, string> = {
  intro: 'Intro / Brand Badge',
  hero: 'Hero',
  videos: 'Video Content',
  top_picks: 'Top Picks',
  reviews: 'Latest Reviews',
  book_of_week: 'Book of the Week',
  interviews: 'Author Interviews',
  mission: 'Our Mission',
  community: 'Community',
  offer: 'What We Offer',
  newsletter: 'Newsletter',
}

/**
 * Merge a stored jsonb blob over the defaults. Shallow by design: nested
 * objects (a CTA, a stats array) are replaced wholesale by the editor, which
 * is what the admin forms submit.
 *
 * A key that is absent has never been edited, so the shipped default stands in
 * — that is what keeps a fresh install from rendering empty boxes. A key that
 * is present but empty is different: an editor cleared that field on purpose,
 * and the site honours it by leaving the field off the page. The admin forms
 * post every field of a section on save, so the two cases never blur.
 */
export function sectionContent<T extends SectionType>(
  type: T,
  stored: unknown,
): SectionContentMap[T] {
  const defaults = SECTION_DEFAULTS[type]
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return defaults

  const merged = { ...defaults } as Record<string, unknown>
  for (const [key, value] of Object.entries(stored as Record<string, unknown>)) {
    if (value === null || value === undefined) continue
    merged[key] = value
  }
  return merged as unknown as SectionContentMap[T]
}
