'use client'

type SvgProps = React.SVGProps<SVGSVGElement>

import type { VideosContent } from '@/lib/cms/sections'
import type { VideoCardView } from '@/lib/cms/types'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '@/lib/anim'
import { watchPath } from '@/lib/video'
import { Divider } from './ui'

/* ============================================================================
   "Stories Brought to Life" — the three video content categories.

   TO EDIT: change the values below. `screen` is the gold title painted on the
   thumbnail; `thumb` is optional — set it to an image in /public/assets and
   that image is used instead of the default cinematic panel, with no layout
   changes needed.
   ========================================================================== */

const Play = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M8 5.5V18.5L19 12L8 5.5Z" /></svg>
)

const Icon = {
  camera: (p: SvgProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2.5" y="6.5" width="13" height="11" rx="2.5" />
      <path d="m15.5 11 5-3v8l-5-3z" />
    </svg>
  ),
  book: (p: SvgProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 7.2C10.4 5.9 8.4 5.3 5.5 5.3A1.5 1.5 0 0 0 4 6.8v10a1.5 1.5 0 0 0 1.5 1.5c2.9 0 4.9.6 6.5 1.9" />
      <path d="M12 7.2c1.6-1.3 3.6-1.9 6.5-1.9A1.5 1.5 0 0 1 20 6.8v10a1.5 1.5 0 0 1-1.5 1.5c-2.9 0-4.9.6-6.5 1.9" />
      <path d="M12 7.2v13" />
    </svg>
  ),
  clapper: (p: SvgProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="9" width="18" height="11" rx="2" />
      <path d="m3.6 8.7 17-2.6" />
      <path d="m7.8 4.9-1 3.4M12.6 4.2l-1 3.4M17.4 3.5l-1 3.4" />
    </svg>
  ),
}

const CATEGORIES = [
  {
    key: 'review',
    icon: 'camera',
    screen: 'Book Review',
    title: 'Video Book Review',
    text: 'In-depth video reviews with honest opinions and detailed analysis of your favorite books.',
    cta: 'Watch Reviews',
    href: '#reviews',
  },
  {
    key: 'summary',
    icon: 'book',
    screen: 'Book Summary',
    title: 'Video Book Summary',
    text: 'Quick, engaging summaries that capture the essence of each book in minutes.',
    cta: 'Watch Summaries',
    href: '#books',
  },
  {
    key: 'trailer',
    icon: 'clapper',
    screen: 'Book Trailer',
    title: 'Book Trailer',
    text: 'Cinematic trailers that bring stories to life and give you a taste of the adventure within.',
    cta: 'Watch Trailers',
    href: '#trailers',
  },
]

export default function Trailer({ content, videos }: { content: VideosContent; videos: VideoCardView[] }) {
  const CATEGORIES = videos
  const root = useRef<any>(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.videos-head > *',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        },
      )
      gsap.fromTo(
        '.video-card',
        { y: 52, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.95, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.videos-grid', start: 'top 82%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="videos card" id="trailers" ref={root}>
      <div className="videos-head section-head">
        <p className="videos-kicker">{content.kicker}</p>
        <Divider width={300} />
        <h2 className="section-title">{content.heading}</h2>
        <p className="videos-sub">{content.subheading}</p>
      </div>

      <div className="videos-grid">
        {CATEGORIES.map((c) => {
          const Badge = Icon[c.icon as keyof typeof Icon] ?? Icon.camera
          // Each card opens its own gallery page. A link an editor has set in
          // /admin/videos wins; the fallback carries the rows still pointing at
          // the on-page anchor they used before those pages existed.
          const href = c.href && !c.href.startsWith('#') ? c.href : watchPath(c.key) ?? c.href
          return (
            <article className="video-card" key={c.key}>
              <div className="video-thumb">
                {c.thumb && <img src={c.thumb} alt="" loading="lazy" />}
                <span className="video-screen">{c.screen}</span>
                <span className="video-play" aria-hidden="true">
                  <Play width="17" height="17" fill="currentColor" />
                </span>
                <span className="video-badge" aria-hidden="true">
                  <Badge width="24" height="24" />
                </span>
              </div>

              <div className="video-body">
                <h3>{c.title}</h3>
                <Divider width={150} />
                <p>{c.text}</p>
                <a className="btn btn-gold-bright video-btn" href={href}>
                  {c.cta}
                  <Play width="13" height="13" fill="currentColor" />
                </a>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
