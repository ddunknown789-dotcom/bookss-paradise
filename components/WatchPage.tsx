'use client'

type SvgProps = React.SVGProps<SVGSVGElement>

import type { VideoItemView } from '@/lib/cms/types'
import type { WatchPageConfig } from '@/lib/video'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import SiteHeader from '@/components/SiteHeader'
import { Divider } from '@/components/ui'
import { NOANIM } from '@/lib/anim'
import { goBack } from '@/lib/router'
import { clampAspect, round, WATCH_LIST, youtubeThumb } from '@/lib/video'
import '@/styles/watch.css'

/* ============================================================================
   A /watch gallery: one page per video category, listing everything the CMS
   holds for it.

   The layout problem this page exists to solve is that the videos are not the
   same shape as each other. A 16:9 review, a 9:16 Reel and a 1:1 teaser all
   have to sit on one page without any of them being cropped, letterboxed, or
   forced into a cell that isn't theirs.

   So no card is ever given a height. Each one declares its own ratio as `--a`
   and reserves exactly that shape before a byte loads; the cards then flow
   down masonry columns, which pack against each other whatever their heights
   are. Adding a video of a shape nobody has used yet needs no layout change,
   and can't leave a hole. The one thing the page decides for itself is how
   many columns to use — see styles/watch.css, where a gallery of one or two
   videos narrows rather than stranding them beside empty space.
   ========================================================================== */

const Play = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M8 5.5V18.5L19 12L8 5.5Z" /></svg>
)

const Back = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 12H6M11 6l-6 6 6 6" />
  </svg>
)

/* -------------------------------------------------------------------------- */
/* one card                                                                    */
/* -------------------------------------------------------------------------- */

function VideoCard({
  item,
  playing,
  onPlay,
}: {
  item: VideoItemView
  playing: boolean
  onPlay: () => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  // The ratio the CMS worked out holds the card's shape until the file itself
  // says otherwise. An upload whose dimensions the media library never
  // recorded is the case this covers: the frame settles to the true shape as
  // soon as the browser reads the file's metadata.
  const [aspect, setAspect] = useState(item.aspect)
  const [poster, setPoster] = useState(
    item.poster || (item.youtubeId ? youtubeThumb(item.youtubeId, 'max') : ''),
  )

  const isYouTube = item.provider === 'youtube'

  /**
   * Step down to a poster that exists.
   *
   * `maxresdefault` is missing for anything YouTube never had a high enough
   * source for, and asking for it then does not 404 — it answers 200 with a
   * grey 120×90 placeholder, which would otherwise be blown up to fill the
   * card. So what arrived has to be measured, not merely awaited.
   *
   * Checked from a ref as well as from `load`, because the browser starts
   * fetching from the server-rendered HTML: an image near the top of the page
   * is often already decoded by the time React hydrates and attaches the
   * handler, and its load event has long since passed.
   */
  const gradePoster = (img: HTMLImageElement | null) => {
    if (!img?.complete) return
    if (img.naturalWidth === 0 || img.naturalWidth <= 120) posterFallback()
  }

  const posterFallback = () => {
    setPoster(
      item.youtubeId && poster === youtubeThumb(item.youtubeId, 'max')
        ? youtubeThumb(item.youtubeId, 'hq')
        : '',
    )
  }

  const start = () => {
    onPlay()
    // The native player is already mounted, so it only has to be told to go.
    if (!isYouTube) video.current?.play().catch(() => {})
  }

  return (
    <article
      className={`wv-card${playing ? ' is-playing' : ''}`}
      style={{ '--a': aspect } as React.CSSProperties}
    >
      <div className="wv-frame">
        {isYouTube
          ? playing && (
              <iframe
                className="wv-embed"
                src={item.src}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )
          : (
            <video
              ref={video}
              className="wv-embed"
              src={item.src}
              poster={poster || undefined}
              controls={playing}
              preload="metadata"
              playsInline
              onPlay={onPlay}
              onLoadedMetadata={(e) => {
                const el = e.currentTarget
                if (el.videoWidth && el.videoHeight) {
                  setAspect(round(clampAspect(el.videoWidth / el.videoHeight)))
                }
              }}
            />
          )}

        {/* The poster is a real button, so every card is reachable by keyboard
            and says what pressing it does. It leaves the DOM the moment
            playback starts — and for YouTube that is also what builds the
            embed, so a page of twenty videos costs twenty images up front, not
            twenty players. */}
        {!playing && (
          <button type="button" className="wv-cover" onClick={start} aria-label={`Play ${item.title}`}>
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                loading="lazy"
                ref={gradePoster}
                onError={posterFallback}
                onLoad={(e) => gradePoster(e.currentTarget)}
              />
            )}
            <span className="wv-play" aria-hidden="true">
              <Play width="19" height="19" fill="currentColor" />
            </span>
            {item.duration && <span className="wv-time">{item.duration}</span>}
          </button>
        )}
      </div>

      <div className="wv-body">
        <h2>{item.title}</h2>
        {item.description && <p>{item.description}</p>}
        {item.publishedLabel && (
          <p className="wv-meta">
            <time dateTime={item.published}>{item.publishedLabel}</time>
          </p>
        )}
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* the page                                                                    */
/* -------------------------------------------------------------------------- */

export default function WatchPage({ page, items }: { page: WatchPageConfig; items: VideoItemView[] }) {
  const root = useRef<any>(null)
  // Only ever one video playing. Starting a second unmounts the first embed
  // rather than leaving two soundtracks to fight each other.
  const [playing, setPlaying] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.wv-head > *',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
      )
      gsap.fromTo(
        '.wv-card',
        { y: 44, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.wv-grid', start: 'top 90%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [items.length])

  const others = WATCH_LIST.filter((p) => p.category !== page.category)

  return (
    <div className="wv" ref={root}>
      <SiteHeader />

      <main className="wv-main">
        {/* Goes back to wherever the visitor came from — the home page cards,
            another gallery, a search result. The href is the fallback for a
            link opened cold, where there is no "back" to return to. */}
        <a
          className="wv-back"
          href="/#trailers"
          onClick={(e) => { e.preventDefault(); goBack('/#trailers') }}
        >
          <Back width="16" height="16" />
          All video content
        </a>

        <header className="wv-head">
          <p className="wv-kicker">{page.kicker}</p>
          <h1 className="wv-title">{page.title}</h1>
          <Divider width={300} />
          <p className="wv-sub">{page.intro}</p>
        </header>

        {items.length > 0 ? (
          // Three columns is the maximum, but a gallery holding one or two
          // videos says so here and narrows to match instead of leaving a
          // column-wide hole beside them.
          <div className="wv-grid" data-count={Math.min(items.length, 3)}>
            {items.map((item) => (
              <VideoCard
                key={item.id}
                item={item}
                playing={playing === item.id}
                onPlay={() => setPlaying(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="wv-empty">
            <h2>{page.emptyTitle}</h2>
            <p>{page.emptyBody}</p>
          </div>
        )}

        <nav className="wv-more" aria-label="Other video content">
          {others.map((p) => (
            <a className="wv-more-link" key={p.category} href={p.path}>
              <span className="wv-more-kicker">{p.kicker}</span>
              <span className="wv-more-title">
                {p.cta}
                <Play width="11" height="11" fill="currentColor" />
              </span>
            </a>
          ))}
        </nav>
      </main>
    </div>
  )
}
