import 'server-only'

import { unstable_cache } from 'next/cache'

import { createPublicClient } from '@/lib/supabase/server'
import { isConfigured, storageUrl } from '@/lib/supabase/env'
import type { SectionType } from '@/lib/supabase/database.types'
import { TAGS } from './cache'
import { parseVideoSource, resolveAspect, round, type WatchCategory } from '@/lib/video'
import { sectionContent, type SectionContentMap } from './sections'
import type {
  BookCardView,
  BookView,
  InterviewView,
  LongPageView,
  MediaView,
  MenuItemView,
  ReviewView,
  SeoView,
  ServiceView,
  SocialLinkView,
  VideoCardView,
  VideoItemView,
  WeekView,
} from './types'

/* -------------------------------------------------------------------------- */
/* helpers                                                                     */
/* -------------------------------------------------------------------------- */

type MediaRef = {
  id: string
  path: string | null
  bucket: string | null
  alt_text: string | null
  width: number | null
  height: number | null
  kind: MediaView['kind']
} | null

/** A media FK resolves to a URL; a legacy `/assets/...` path passes through. */
const mediaSrc = (m: MediaRef, fallback = ''): string =>
  m?.path ? storageUrl(m.path, m.bucket ?? 'media') : fallback

const mediaView = (m: MediaRef): MediaView | null =>
  m
    ? {
        id: m.id,
        src: mediaSrc(m),
        alt: m.alt_text ?? '',
        width: m.width,
        height: m.height,
        kind: m.kind ?? 'image',
      }
    : null

const MEDIA_COLS = 'id, path, bucket, alt_text, width, height, kind'

/**
 * A `date` column as a human reads it. Formatted in UTC on purpose: a plain
 * calendar date has no time zone, and letting the server's own offset apply
 * would date half the world's videos to the day before.
 */
function dayLabel(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

/**
 * Wrap a query so the site renders instead of crashing when Supabase isn't
 * configured yet, or when a query fails in production. Content disappearing is
 * bad; a 500 on the homepage is worse.
 */
function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  if (!isConfigured) return Promise.resolve(fallback)
  return fn().catch((err) => {
    console.error(`[cms] ${label} failed:`, err?.message ?? err)
    return fallback
  })
}

/** unstable_cache with our tag conventions and a long TTL — tags do the work. */
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  tags: string[],
): (...args: A) => Promise<R> {
  return unstable_cache(fn, keyParts, { tags, revalidate: 3600 }) as (...args: A) => Promise<R>
}

/* -------------------------------------------------------------------------- */
/* settings + seo                                                              */
/* -------------------------------------------------------------------------- */

export const getSettings = cached(
  async (): Promise<Record<string, unknown>> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db.from('settings').select('key, value')
        const out: Record<string, unknown> = {}
        for (const row of data ?? []) out[row.key] = row.value
        return out
      },
      {},
      'getSettings',
    ),
  ['settings'],
  [TAGS.settings],
)

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const all = await getSettings()
  const value = all[key]
  return value === undefined || value === null ? fallback : (value as T)
}

const EMPTY_SEO: SeoView = {
  title: null,
  description: null,
  canonical: null,
  noindex: false,
  nofollow: false,
  ogTitle: null,
  ogDescription: null,
  ogType: 'website',
  ogImage: null,
  twitterCard: 'summary_large_image',
  twitterSite: null,
  twitterCreator: null,
  structuredData: null,
  keywords: [],
}

export const getSeo = cached(
  async (entityType: string, entityId?: string | null): Promise<SeoView> =>
    safe(
      async () => {
        const db = createPublicClient()
        let q = db
          .from('seo_meta')
          .select(`*, og_image:media!seo_meta_og_image_id_fkey(${MEDIA_COLS})`)
          .eq('entity_type', entityType as never)
        q = entityId ? q.eq('entity_id', entityId) : q.is('entity_id', null)

        const { data } = await q.maybeSingle()
        if (!data) return EMPTY_SEO
        return {
          title: data.title,
          description: data.description,
          canonical: data.canonical_url,
          noindex: data.robots_noindex,
          nofollow: data.robots_nofollow,
          ogTitle: data.og_title,
          ogDescription: data.og_description,
          ogType: data.og_type ?? 'website',
          ogImage: mediaSrc((data as unknown as { og_image?: MediaRef }).og_image ?? null) || null,
          twitterCard: data.twitter_card ?? 'summary_large_image',
          twitterSite: data.twitter_site,
          twitterCreator: data.twitter_creator,
          structuredData: data.structured_data,
          keywords: data.keywords ?? [],
        }
      },
      EMPTY_SEO,
      'getSeo',
    ),
  ['seo'],
  [TAGS.seo],
)

/* -------------------------------------------------------------------------- */
/* page sections                                                               */
/* -------------------------------------------------------------------------- */

export type SectionRow<T extends SectionType = SectionType> = {
  id: string
  type: T
  visible: boolean
  sort_order: number
  content: SectionContentMap[T]
}

export const getPageSections = cached(
  async (slug: string): Promise<SectionRow[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data: page } = await db.from('pages').select('id').eq('slug', slug).maybeSingle()
        if (!page) return []

        const { data } = await db
          .from('page_sections')
          .select('id, type, visible, sort_order, content')
          .eq('page_id', page.id)
          .eq('visible', true)
          .order('sort_order')

        return (data ?? []).map((row) => ({
          id: row.id,
          type: row.type,
          visible: row.visible,
          sort_order: row.sort_order,
          content: sectionContent(row.type, row.content),
        })) as SectionRow[]
      },
      [],
      'getPageSections',
    ),
  ['page-sections'],
  [TAGS.sections],
)

/* -------------------------------------------------------------------------- */
/* books                                                                       */
/* -------------------------------------------------------------------------- */

const BOOK_CARD_COLS = `
  id, slug, title, primary_genre, rating, sort_order, publication_date,
  author:authors(name, slug),
  cover:media!books_cover_id_fkey(${MEDIA_COLS})
`

type BookCardRow = {
  id: string
  slug: string
  title: string
  primary_genre: string | null
  rating: number | null
  author: { name: string; slug: string } | null
  cover: MediaRef
}

const toCard = (b: BookCardRow): BookCardView => ({
  id: b.id,
  slug: b.slug,
  title: b.title,
  author: b.author?.name ?? '',
  genre: b.primary_genre ?? '',
  rating: Number(b.rating ?? 0),
  coverSrc: mediaSrc(b.cover),
  href: `/books/${b.slug}`,
})

export const getBooks = cached(
  async (limit: number = 100): Promise<BookCardView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('books')
          .select(BOOK_CARD_COLS)
          .eq('status', 'published')
          .order('sort_order')
          .limit(limit)
        return ((data ?? []) as unknown as BookCardRow[]).map(toCard)
      },
      [],
      'getBooks',
    ),
  ['books'],
  [TAGS.books],
)

export const getFeaturedBooks = cached(
  async (limit: number = 6): Promise<BookCardView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('books')
          .select(BOOK_CARD_COLS)
          .eq('status', 'published')
          .order('featured', { ascending: false })
          .order('sort_order')
          .limit(limit)
        return ((data ?? []) as unknown as BookCardRow[]).map(toCard)
      },
      [],
      'getFeaturedBooks',
    ),
  ['featured-books'],
  [TAGS.books],
)

/** Book cards plus the review excerpt the homepage "Latest Reviews" grid shows. */
export const getBooksWithReviews = cached(
  async (limit: number = 6): Promise<(BookCardView & { excerpt: string })[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('books')
          .select(`${BOOK_CARD_COLS}, review_excerpt`)
          .eq('status', 'published')
          .not('review_excerpt', 'is', null)
          .order('sort_order')
          .limit(limit)
        return ((data ?? []) as unknown as (BookCardRow & { review_excerpt: string })[]).map((b) => ({
          ...toCard(b),
          excerpt: b.review_excerpt ?? '',
        }))
      },
      [],
      'getBooksWithReviews',
    ),
  ['books-with-reviews'],
  [TAGS.books],
)

export const getBookSlugs = cached(
  async (): Promise<{ slug: string; updated_at: string }[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db.from('books').select('slug, updated_at').eq('status', 'published')
        return data ?? []
      },
      [],
      'getBookSlugs',
    ),
  ['book-slugs'],
  [TAGS.books],
)

const EMPTY_LONG: LongPageView = {
  intro: [],
  sections: [],
  worked: [],
  better: [],
  verdict: '',
  quote: '',
  bars: [],
  takeaways: [],
}

export async function getBook(slug: string): Promise<BookView | null> {
  const load = cached(
    async (bookSlug: string): Promise<BookView | null> =>
      safe(
        async () => {
          const db = createPublicClient()
          const { data } = await db
            .from('books')
            .select(
              `
              *,
              author:authors(id, name, slug, bio),
              cover:media!books_cover_id_fkey(${MEDIA_COLS}),
              cover3d:media!books_cover_3d_id_fkey(${MEDIA_COLS}),
              aboutImage:media!books_about_image_id_fkey(${MEDIA_COLS}),
              categories:book_categories(sort_order, category:categories(name, slug)),
              features:book_features(icon, title, text, sort_order),
              retailers:book_retailers(name, mark, tone, url, cta, sort_order),
              videos:book_videos(label, caption, duration, video_url, sort_order, thumb:media!book_videos_thumb_id_fkey(${MEDIA_COLS})),
              gallery:book_media(role, sort_order, media:media(${MEDIA_COLS})),
              points:book_review_points(kind, text, sort_order),
              sections:book_sections(kind, heading, body, sort_order),
              longPages:book_long_pages(kind, intro, verdict, quote, bars, takeaways)
            `,
            )
            .eq('slug', bookSlug)
            .eq('status', 'published')
            .maybeSingle()

          if (!data) return null
          const row = data as Record<string, any>

          const sorted = <T extends { sort_order: number }>(arr: T[] | null): T[] =>
            [...(arr ?? [])].sort((a, b) => a.sort_order - b.sort_order)

          const longPage = (kind: 'review' | 'summary'): LongPageView => {
            const lp = (row.longPages ?? []).find((p: any) => p.kind === kind)
            const secs = sorted(row.sections ?? [])
              .filter((s: any) => s.kind === kind)
              .map((s: any) => ({ title: s.heading ?? '', body: s.body }))
            if (!lp && !secs.length) return EMPTY_LONG
            return {
              intro: lp?.intro ?? [],
              sections: secs,
              worked: sorted(row.points ?? []).filter((p: any) => p.kind === 'loved').map((p: any) => p.text),
              better: sorted(row.points ?? []).filter((p: any) => p.kind === 'better').map((p: any) => p.text),
              verdict: lp?.verdict ?? '',
              quote: lp?.quote ?? '',
              bars: (lp?.bars ?? []) as LongPageView['bars'],
              takeaways: (lp?.takeaways ?? []) as LongPageView['takeaways'],
            }
          }

          const genres = sorted(row.categories ?? []).map((c: any) => c.category?.name).filter(Boolean)

          return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            subtitle: row.subtitle ?? '',
            author: row.author?.name ?? '',
            authorSlug: row.author?.slug ?? null,
            authorBio: row.author?.bio ?? '',
            genre: row.primary_genre ?? genres[0] ?? '',
            genres,
            rating: Number(row.rating ?? 0),
            reviewCount: row.review_count ?? 0,
            pages: row.pages ?? 0,
            published: row.published_label ?? '',
            publicationDate: row.publication_date,
            isbn: row.isbn ?? '',
            language: row.language ?? '',
            publisher: row.publisher ?? '',
            verified: row.verified ?? true,
            coverSrc: mediaSrc(row.cover),
            cover3dSrc: mediaSrc(row.cover3d) || mediaSrc(row.cover),
            aboutImage: mediaSrc(row.aboutImage),
            href: `/books/${row.slug}`,
            pull: row.pull_quote_lines ?? [],
            about: row.description ?? '',
            summaryLines: row.summary_lines ?? [],
            summaryBody: row.summary ?? '',
            special: sorted(row.features ?? []).map((f: any) => ({
              icon: f.icon,
              title: f.title,
              text: f.text ?? '',
            })),
            review: {
              text: row.review_excerpt ?? '',
              overall: Number(row.review_overall ?? row.rating ?? 0),
              loved: sorted(row.points ?? []).filter((p: any) => p.kind === 'loved').map((p: any) => p.text),
              better: sorted(row.points ?? []).filter((p: any) => p.kind === 'better').map((p: any) => p.text),
            },
            retailers: sorted(row.retailers ?? []).map((r: any) => ({
              name: r.name,
              mark: r.mark ?? '',
              tone: r.tone ?? '#1f4634',
              url: r.url ?? '',
              cta: r.cta ?? `View on ${r.name}`,
            })),
            videos: sorted(row.videos ?? []).map((v: any) => ({
              label: v.label,
              caption: v.caption ?? '',
              duration: v.duration ?? '',
              thumb: mediaSrc(v.thumb),
              url: v.video_url ?? '',
            })),
            gallery: sorted(row.gallery ?? [])
              .map((g: any) => mediaView(g.media))
              .filter(Boolean) as MediaView[],
            fullReview: longPage('review'),
            fullSummary: longPage('summary'),
            related: [],
          }
        },
        null,
        'getBook',
      ),
    ['book', slug],
    [TAGS.books, TAGS.book(slug)],
  )

  const book = await load(slug)
  if (!book) return null
  book.related = await getRelatedBooks(book.id, slug)
  return book
}

export const getRelatedBooks = cached(
  async (bookId: string, slug: string): Promise<BookCardView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data: explicit } = await db
          .from('book_related')
          .select(`sort_order, related:books!book_related_related_book_id_fkey(${BOOK_CARD_COLS})`)
          .eq('book_id', bookId)
          .order('sort_order')

        const picked = (explicit ?? [])
          .map((r) => (r as unknown as { related: BookCardRow }).related)
          .filter(Boolean)
        if (picked.length) return picked.map(toCard)

        // No hand-picked list: fall back to other published titles, matching
        // the behaviour the site shipped with.
        const { data } = await db
          .from('books')
          .select(BOOK_CARD_COLS)
          .eq('status', 'published')
          .neq('slug', slug)
          .order('sort_order')
          .limit(3)
        return ((data ?? []) as unknown as BookCardRow[]).map(toCard)
      },
      [],
      'getRelatedBooks',
    ),
  ['related-books'],
  [TAGS.books],
)

/* -------------------------------------------------------------------------- */
/* interviews                                                                  */
/* -------------------------------------------------------------------------- */

const INTERVIEW_COLS = `
  id, slug, title, intro, minutes, published_label, published_on, sort_order,
  image:media!interviews_image_id_fkey(${MEDIA_COLS}),
  author:authors(name, slug),
  book:books(title, slug)
`

const toInterview = (row: any, qa: { q: string; a: string }[] = []): InterviewView => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  author: row.author?.name ?? '',
  bookTitle: row.book?.title ?? '',
  bookSlug: row.book?.slug ?? null,
  image: mediaSrc(row.image),
  minutes: row.minutes ?? '',
  date: row.published_label ?? '',
  iso: row.published_on,
  intro: row.intro ?? '',
  qa,
  href: `/interviews/${row.slug}`,
})

export const getInterviews = cached(
  async (limit: number = 20): Promise<InterviewView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('interviews')
          .select(INTERVIEW_COLS)
          .eq('status', 'published')
          .order('sort_order')
          .limit(limit)
        return (data ?? []).map((r) => toInterview(r))
      },
      [],
      'getInterviews',
    ),
  ['interviews'],
  [TAGS.interviews],
)

export const getInterview = cached(
  async (slug: string): Promise<InterviewView | null> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('interviews')
          .select(`${INTERVIEW_COLS}, qa:interview_qa(question, answer, sort_order)`)
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle()
        if (!data) return null
        const row = data as Record<string, any>
        const qa = [...(row.qa ?? [])]
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((x: any) => ({ q: x.question, a: x.answer }))
        return toInterview(row, qa)
      },
      null,
      'getInterview',
    ),
  ['interview'],
  [TAGS.interviews],
)

/* -------------------------------------------------------------------------- */
/* weeks                                                                       */
/* -------------------------------------------------------------------------- */

export const getWeeks = cached(
  async (): Promise<WeekView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('weeks')
          .select(
            `id, key, label, range_label, sort_order,
             books:week_books(title, author, genre, pages, published_label, sort_order,
               cover:media!week_books_cover_id_fkey(${MEDIA_COLS}),
               book:books(slug))`,
          )
          .eq('status', 'published')
          .order('sort_order')

        return (data ?? []).map((w) => {
          const row = w as Record<string, any>
          return {
            id: row.id,
            key: row.key,
            label: row.label,
            range: row.range_label ?? '',
            books: [...(row.books ?? [])]
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((b: any) => {
                const slug = b.book?.slug ?? null
                return {
                  title: b.title,
                  author: b.author ?? '',
                  genre: b.genre ?? '',
                  pages: b.pages,
                  published: b.published_label ?? '',
                  coverSrc: mediaSrc(b.cover),
                  slug,
                  href: slug ? `/books/${slug}` : null,
                }
              }),
          }
        })
      },
      [],
      'getWeeks',
    ),
  ['weeks'],
  [TAGS.weeks],
)

export async function getCurrentWeek(): Promise<WeekView | null> {
  const weeks = await getWeeks()
  return weeks[0] ?? null
}

/* -------------------------------------------------------------------------- */
/* videos, services, reviews                                                   */
/* -------------------------------------------------------------------------- */

export const getVideos = cached(
  async (): Promise<VideoCardView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('videos')
          .select(`*, thumb:media!videos_thumb_id_fkey(${MEDIA_COLS})`)
          .eq('status', 'published')
          .order('sort_order')
        return (data ?? []).map((v) => {
          const row = v as Record<string, any>
          return {
            key: row.key,
            icon: row.icon,
            screen: row.screen_label ?? '',
            title: row.title,
            text: row.description ?? '',
            cta: row.cta_label ?? '',
            href: row.cta_href ?? '',
            thumb: mediaSrc(row.thumb),
            videoUrl: row.video_url ?? '',
          }
        })
      },
      [],
      'getVideos',
    ),
  ['videos'],
  [TAGS.videos],
)

/**
 * The videos on one /watch gallery page.
 *
 * A row carries either a pasted URL or an uploaded file, never both by
 * necessity — `video_url` wins when it is filled in, so an editor can point a
 * row at YouTube without first detaching whatever file it used to play. Every
 * row comes back already resolved into something the player can use, and with
 * an aspect ratio, so the gallery can reserve each card's exact shape before
 * anything loads.
 */
export const getVideoItems = cached(
  async (category: WatchCategory): Promise<VideoItemView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('video_items')
          .select(
            `*,
             file:media!video_items_media_id_fkey(${MEDIA_COLS}),
             poster:media!video_items_poster_id_fkey(${MEDIA_COLS})`,
          )
          .eq('category', category)
          .eq('status', 'published')
          .order('sort_order')

        return (data ?? [])
          .map((v) => {
            const row = v as Record<string, any>
            const source = parseVideoSource(String(row.video_url ?? '').trim() || mediaSrc(row.file))
            const poster = mediaSrc(row.poster, String(row.poster_url ?? '').trim())

            return {
              id: row.id,
              category: row.category as WatchCategory,
              title: row.title,
              description: row.description ?? '',
              duration: row.duration ?? '',
              published: row.published_at ?? '',
              publishedLabel: dayLabel(row.published_at),
              provider: source.provider,
              youtubeId: source.youtubeId,
              src: source.embedUrl,
              poster,
              // An uploaded file knows its own dimensions; a YouTube link does
              // not, which is what the `aspect` column is there to answer.
              aspect: round(resolveAspect(row.aspect, row.file?.width, row.file?.height, source)),
            }
          })
          // A row with no playable source would render an empty frame. Better
          // that a half-finished row is simply not on the page yet.
          .filter((item) => item.provider !== 'none')
      },
      [],
      `getVideoItems(${category})`,
    ),
  ['video-items'],
  [TAGS.videoItems],
)

export const getServices = cached(
  async (): Promise<ServiceView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('services')
          .select('key, glyph, title_lines, description, sort_order')
          .eq('visible', true)
          .order('sort_order')
        return (data ?? []).map((s) => ({
          key: s.key,
          glyph: s.glyph,
          title: s.title_lines ?? [],
          desc: s.description ?? '',
        }))
      },
      [],
      'getServices',
    ),
  ['services'],
  [TAGS.services],
)

export const getBookReviews = cached(
  async (bookId: string): Promise<ReviewView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('reviews')
          .select(`*, avatar:media!reviews_avatar_id_fkey(${MEDIA_COLS})`)
          .eq('book_id', bookId)
          .eq('status', 'approved')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })
        return (data ?? []).map((r) => {
          const row = r as Record<string, any>
          return {
            id: row.id,
            bookId: row.book_id,
            authorName: row.author_name,
            rating: row.rating,
            title: row.title ?? '',
            body: row.body,
            avatar: mediaSrc(row.avatar),
            createdAt: row.created_at,
          }
        })
      },
      [],
      'getBookReviews',
    ),
  ['book-reviews'],
  [TAGS.reviews],
)

/* -------------------------------------------------------------------------- */
/* navigation, footer                                                          */
/* -------------------------------------------------------------------------- */

export const getMenu = cached(
  async (key: string): Promise<MenuItemView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data: menu } = await db.from('menus').select('id').eq('key', key).maybeSingle()
        if (!menu) return []

        const { data } = await db
          .from('menu_items')
          .select('id, parent_id, label, href, target, sort_order')
          .eq('menu_id', menu.id)
          .eq('visible', true)
          .order('sort_order')

        const rows = data ?? []
        const byParent = new Map<string | null, typeof rows>()
        for (const r of rows) {
          const list = byParent.get(r.parent_id) ?? []
          list.push(r)
          byParent.set(r.parent_id, list)
        }
        const build = (parent: string | null): MenuItemView[] =>
          (byParent.get(parent) ?? []).map((r) => ({
            id: r.id,
            label: r.label,
            href: r.href,
            target: r.target,
            children: build(r.id),
          }))
        return build(null)
      },
      [],
      'getMenu',
    ),
  ['menu'],
  [TAGS.menus],
)

export const getSocialLinks = cached(
  async (): Promise<SocialLinkView[]> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('social_links')
          .select('id, platform, label, url, icon')
          .eq('visible', true)
          .order('sort_order')
        return (data ?? []).map((s) => ({
          id: s.id,
          platform: s.platform,
          label: s.label ?? s.platform,
          url: s.url,
          icon: s.icon ?? s.platform,
        }))
      },
      [],
      'getSocialLinks',
    ),
  ['social-links'],
  [TAGS.social],
)

export const getCategories = cached(
  async (type: 'genre' | 'tag' | 'category' = 'genre') =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('categories')
          .select('id, name, slug, description, sort_order')
          .eq('type', type)
          .eq('visible', true)
          .order('sort_order')
        return data ?? []
      },
      [],
      'getCategories',
    ),
  ['categories'],
  [TAGS.categories],
)

/** The shared pull-quote banner at the foot of every book page. */
export const getPageQuote = cached(
  async (): Promise<{ text: string; author: string }> =>
    safe(
      async () => {
        const db = createPublicClient()
        const { data } = await db
          .from('book_quotes')
          .select('text, attribution')
          .is('book_id', null)
          .order('sort_order')
          .limit(1)
          .maybeSingle()
        return { text: data?.text ?? '', author: data?.attribution ?? '' }
      },
      { text: '', author: '' },
      'getPageQuote',
    ),
  ['page-quote'],
  [TAGS.books],
)
