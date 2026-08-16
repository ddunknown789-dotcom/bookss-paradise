/**
 * View models.
 *
 * These mirror the exact shapes the existing React components already consume,
 * so porting a component to the CMS is a change of import — not of markup.
 * Mapping from database rows happens once, in queries.ts.
 */

import type { VideoProvider, WatchCategory } from '@/lib/video'

export type MediaView = {
  id: string
  src: string
  alt: string
  width: number | null
  height: number | null
  kind: 'image' | 'video' | 'pdf' | 'audio' | 'other'
}

export type FeatureView = { icon: string; title: string; text: string }
export type RetailerView = { name: string; mark: string; tone: string; url: string; cta: string }
export type BookVideoView = { label: string; caption: string; duration: string; thumb: string; url: string }
export type ScoreBar = { label: string; value: number }
export type Takeaway = { icon: string; title: string; text: string }

export type LongPageView = {
  intro: string[]
  sections: { title: string; body: string }[]
  worked: string[]
  better: string[]
  verdict: string
  quote: string
  bars: ScoreBar[]
  takeaways: Takeaway[]
}

export type BookCardView = {
  id: string
  slug: string
  title: string
  author: string
  genre: string
  rating: number
  coverSrc: string
  href: string
}

export type BookView = BookCardView & {
  subtitle: string
  authorSlug: string | null
  authorBio: string
  cover3dSrc: string
  aboutImage: string
  genres: string[]
  reviewCount: number
  pages: number
  published: string
  publicationDate: string | null
  isbn: string
  language: string
  publisher: string
  verified: boolean
  pull: string[]
  about: string
  summaryLines: string[]
  summaryBody: string
  special: FeatureView[]
  review: { text: string; overall: number; loved: string[]; better: string[] }
  retailers: RetailerView[]
  videos: BookVideoView[]
  gallery: MediaView[]
  fullReview: LongPageView
  fullSummary: LongPageView
  related: BookCardView[]
}

export type InterviewView = {
  id: string
  slug: string
  title: string
  author: string
  bookTitle: string
  bookSlug: string | null
  image: string
  minutes: string
  date: string
  iso: string | null
  intro: string
  qa: { q: string; a: string }[]
  href: string
}

export type WeekBookView = {
  title: string
  author: string
  genre: string
  pages: number | null
  published: string
  coverSrc: string
  slug: string | null
  href: string | null
}

export type WeekView = {
  id: string
  key: string
  label: string
  range: string
  books: WeekBookView[]
}

export type VideoCardView = {
  key: string
  icon: string
  screen: string
  title: string
  text: string
  cta: string
  href: string
  thumb: string
  videoUrl: string
}

/** One video in a /watch gallery. Already resolved: the page just plays it. */
export type VideoItemView = {
  id: string
  category: WatchCategory
  title: string
  description: string
  duration: string
  /** ISO date the video went out, or '' — shown on the card and in its schema. */
  published: string
  /** The same date, written the way the card shows it. */
  publishedLabel: string
  provider: VideoProvider
  youtubeId: string | null
  /** The embed URL for YouTube, or the file URL for an upload. */
  src: string
  /** Empty for a YouTube video with no custom poster — the card fills it in. */
  poster: string
  /** width ÷ height. Always set: the gallery sizes every card from it. */
  aspect: number
}

export type ServiceView = {
  key: string
  glyph: string
  title: string[]
  desc: string
}

export type ReviewView = {
  id: string
  bookId: string | null
  authorName: string
  rating: number | null
  title: string
  body: string
  avatar: string
  createdAt: string
}

export type MenuItemView = {
  id: string
  label: string
  href: string
  target: '_self' | '_blank'
  children: MenuItemView[]
}

export type SocialLinkView = {
  id: string
  platform: string
  label: string
  url: string
  icon: string
}

export type SeoView = {
  title: string | null
  description: string | null
  canonical: string | null
  noindex: boolean
  nofollow: boolean
  ogTitle: string | null
  ogDescription: string | null
  ogType: string
  ogImage: string | null
  twitterCard: string
  twitterSite: string | null
  twitterCreator: string | null
  structuredData: unknown
  keywords: string[]
}

export type SettingsView = Record<string, unknown>
