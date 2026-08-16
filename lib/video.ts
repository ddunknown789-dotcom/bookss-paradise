/**
 * The three "Watch" galleries, and how any one video in them gets played.
 *
 * Deliberately free of `server-only` and of every Supabase import: the query
 * layer shapes rows with these functions and the gallery component calls the
 * same ones in the browser, so a card can never disagree with its own data.
 */

/* -------------------------------------------------------------------------- */
/* the three pages                                                             */
/* -------------------------------------------------------------------------- */

/** Matches the `key` of the three home page cards and `video_items.category`. */
export type WatchCategory = 'review' | 'summary' | 'trailer'

export type WatchPageConfig = {
  category: WatchCategory
  path: string
  /** The button on the home page that opens this page. */
  cta: string
  kicker: string
  title: string
  intro: string
  /** Shown in the breadcrumb trail and its JSON-LD. */
  crumb: string
  metaTitle: string
  metaDescription: string
  /** Copy for a category an editor hasn't filled yet. */
  emptyTitle: string
  emptyBody: string
}

export const WATCH_PAGES: Record<WatchCategory, WatchPageConfig> = {
  review: {
    category: 'review',
    path: '/watch/reviews',
    cta: 'Watch Reviews',
    kicker: 'Video Book Reviews',
    title: 'Reviews Worth Watching',
    intro:
      'In-depth video reviews with honest opinions and detailed analysis of the books we love — and the ones we argue about.',
    crumb: 'Watch Reviews',
    metaTitle: 'Video Book Reviews',
    metaDescription:
      'Watch in-depth video book reviews from Books Paradise — honest opinions and detailed analysis of every title we read.',
    emptyTitle: 'The first reviews are being cut',
    emptyBody: 'New video reviews land here as soon as they are published.',
  },
  summary: {
    category: 'summary',
    path: '/watch/summaries',
    cta: 'Watch Summaries',
    kicker: 'Video Book Summaries',
    title: 'A Whole Book in Minutes',
    intro:
      'Quick, engaging summaries that capture the essence of each book — the ideas, the turns and the reason it stays with you.',
    crumb: 'Watch Summaries',
    metaTitle: 'Video Book Summaries',
    metaDescription:
      'Watch short video book summaries from Books Paradise — the essence of each book captured in minutes.',
    emptyTitle: 'The first summaries are being cut',
    emptyBody: 'New video summaries land here as soon as they are published.',
  },
  trailer: {
    category: 'trailer',
    path: '/watch/trailers',
    cta: 'Watch Trailers',
    kicker: 'Cinematic Book Trailers',
    title: 'Stories Brought to Life',
    intro:
      'Cinematic trailers that give a story its own screen — a taste of the world inside the book before you open it.',
    crumb: 'Watch Trailers',
    metaTitle: 'Cinematic Book Trailers',
    metaDescription:
      'Watch cinematic book trailers produced by Books Paradise — a taste of the world inside each book.',
    emptyTitle: 'The first trailers are in production',
    emptyBody: 'New book trailers land here as soon as they are published.',
  },
}

/** Page order — the same order the cards sit in on the home page. */
export const WATCH_ORDER: WatchCategory[] = ['review', 'summary', 'trailer']

export const WATCH_LIST: WatchPageConfig[] = WATCH_ORDER.map((c) => WATCH_PAGES[c])

/** The gallery page for a category key, or null if the key isn't one of ours. */
export function watchPath(category: string): string | null {
  return WATCH_PAGES[category as WatchCategory]?.path ?? null
}

export const isWatchCategory = (v: string): v is WatchCategory => v in WATCH_PAGES

/* -------------------------------------------------------------------------- */
/* video sources                                                               */
/* -------------------------------------------------------------------------- */

export type VideoProvider = 'youtube' | 'file' | 'none'

export type VideoSource = {
  provider: VideoProvider
  /** Set for every shape of YouTube link; null for uploaded files. */
  youtubeId: string | null
  /** What the player loads: a privacy-mode embed, or the file itself. */
  embedUrl: string
  /** Seconds to start at, taken from a ?t= / ?start= on the link. */
  start: number
  /** A Shorts link is vertical by definition — worth knowing before it loads. */
  vertical: boolean
}

const EMPTY: VideoSource = { provider: 'none', youtubeId: null, embedUrl: '', start: 0, vertical: false }

/** YouTube ids are always exactly 11 URL-safe characters. */
const ID = /^[\w-]{11}$/

const YOUTUBE_HOSTS = /^(?:www\.|m\.|music\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)$/i

/** `?t=1m30s`, `?t=90` and `?start=90` all mean the same thing to a player. */
function seconds(raw: string | null): number {
  if (!raw) return 0
  if (/^\d+$/.test(raw)) return Number(raw)
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i)
  if (!m) return 0
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
}

/**
 * The video id behind any YouTube address an editor might paste — a normal
 * watch link, a share link, a Shorts link, a live link, or an embed URL that
 * was copied out of someone else's page. A bare id is accepted too, because
 * that is what half the people who fill in a "YouTube video" field type.
 */
export function youtubeId(input: string): string | null {
  const raw = (input ?? '').trim()
  if (!raw) return null
  if (ID.test(raw)) return raw

  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  } catch {
    return null
  }
  if (!YOUTUBE_HOSTS.test(url.hostname)) return null

  // youtu.be/ID  →  the whole path is the id
  if (/youtu\.be$/i.test(url.hostname)) {
    const id = url.pathname.slice(1).split('/')[0]
    return ID.test(id) ? id : null
  }

  const v = url.searchParams.get('v')
  if (v && ID.test(v)) return v

  // /embed/ID, /shorts/ID, /live/ID, /v/ID
  const [, kind, id] = url.pathname.split('/')
  return ['embed', 'shorts', 'live', 'v'].includes(kind) && ID.test(id) ? id : null
}

/**
 * Read a URL the way the player has to.
 *
 * A YouTube address of any shape becomes a nocookie embed that plays inside
 * the page; everything else (a Supabase storage URL, a /public file, any
 * direct link to an .mp4) is handed to the browser's own video element.
 */
export function parseVideoSource(input: string): VideoSource {
  const raw = (input ?? '').trim()
  if (!raw) return EMPTY

  const id = youtubeId(raw)
  if (id) {
    let start = 0
    let vertical = false
    try {
      const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
      start = seconds(url.searchParams.get('t') ?? url.searchParams.get('start'))
      vertical = /\/shorts\//i.test(url.pathname)
    } catch {
      /* a bare id has no params to read */
    }
    return { provider: 'youtube', youtubeId: id, embedUrl: youtubeEmbedUrl(id, start), start, vertical }
  }

  // Anything else is treated as a file for the browser to play — but only if
  // it is at least shaped like an address. A typo in the field should leave
  // the video out of the gallery, not put a black rectangle in it.
  return /^(https?:\/\/|\/)/i.test(raw) ? { ...EMPTY, provider: 'file', embedUrl: raw } : EMPTY
}

/**
 * The embed the card swaps itself for on click.
 *
 * `youtube-nocookie.com` keeps YouTube from writing tracking cookies for
 * visitors who never press play, and `rel=0` keeps the end screen inside our
 * own channel instead of sending the viewer off to whatever autoplays next —
 * the whole point being that people watch here rather than on YouTube.
 */
export function youtubeEmbedUrl(id: string, start = 0, autoplay = true): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    color: 'white',
  })
  if (autoplay) params.set('autoplay', '1')
  if (start > 0) params.set('start', String(start))
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

/**
 * Poster frames YouTube generates for every upload. `maxres` doesn't exist for
 * older or low-resolution videos, so the card falls back to `hq`, which always
 * does.
 */
export function youtubeThumb(id: string, size: 'max' | 'hq' = 'max'): string {
  return `https://i.ytimg.com/vi/${id}/${size === 'max' ? 'maxresdefault' : 'hqdefault'}.jpg`
}

/* -------------------------------------------------------------------------- */
/* aspect ratios                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The shapes an editor can pick from, and what each one means as a number.
 *
 * `auto` is the honest default: for an uploaded file the real dimensions are
 * already in the media library, and for a Shorts link the URL says vertical —
 * so the only time the fallback below is used is a plain YouTube link, where
 * 16:9 is right for all but a rounding error's worth of videos.
 */
export const ASPECT_OPTIONS = [
  { value: 'auto', label: 'Auto', ratio: null },
  { value: 'landscape', label: 'Landscape 16:9', ratio: 16 / 9 },
  { value: 'wide', label: 'Cinemascope 21:9', ratio: 21 / 9 },
  { value: 'classic', label: 'Classic 4:3', ratio: 4 / 3 },
  { value: 'square', label: 'Square 1:1', ratio: 1 },
  { value: 'tall', label: 'Portrait 4:5', ratio: 4 / 5 },
  { value: 'vertical', label: 'Vertical 9:16', ratio: 9 / 16 },
] as const

export const DEFAULT_ASPECT = 16 / 9

const RATIOS: Record<string, number | null> = Object.fromEntries(
  ASPECT_OPTIONS.map((o) => [o.value, o.ratio]),
)

/**
 * The shape to reserve for a video before a single byte of it has loaded.
 *
 * An editor's explicit choice wins, then the real pixel dimensions of an
 * uploaded file, then what the URL itself gives away. Nothing here ever crops:
 * the number returned is the box the gallery draws, and the video fills it.
 */
export function resolveAspect(
  aspect: string | null | undefined,
  width: number | null | undefined,
  height: number | null | undefined,
  source: VideoSource,
): number {
  const chosen = aspect ? RATIOS[aspect] : null
  if (chosen) return chosen
  if (width && height && width > 0 && height > 0) return clampAspect(width / height)
  if (source.vertical) return 9 / 16
  return DEFAULT_ASPECT
}

/**
 * Nothing narrower than 9:20 or wider than 3:1 gets to set a card's height.
 *
 * Real video never reaches either end; a file whose recorded dimensions do is
 * a broken metadata entry, and honouring it would hand one card a column of
 * its own several screens tall. Past the limit the frame stops following the
 * file and the video sits inside it whole, uncropped.
 */
export function clampAspect(ratio: number): number {
  return Math.min(Math.max(ratio, 0.45), 3)
}

/** Ratios are rounded before they reach CSS so `1.7777777777` never ships. */
export const round = (n: number): number => Math.round(n * 1000) / 1000
