'use client'

import type { WeekView } from '@/lib/cms/types'

import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import SiteHeader from '@/components/SiteHeader'
import { Divider } from '@/components/ui'
import { NOANIM } from '@/lib/anim'
import '@/styles/weeks.css'

/* The full Book of the Week archive. Every row is one entry from
   src/data/weeks.js — add, edit or delete weeks there and this page
   follows without any layout changes. */

export default function WeeksPage({ weeks }: { weeks: WeekView[] }) {
  const WEEKS_RESOLVED = weeks
  const root = useRef<any>(null)

  useEffect(() => {
    const prev = document.title
    document.title = "Every Week's Book of the Week | Books Paradise"
    return () => { document.title = prev }
  }, [])

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.wk-head > *',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
      )
      // Each week fades up as it comes into view, its books trailing behind.
      gsap.utils.toArray<HTMLElement>('.wk-week').forEach((row) => {
        gsap.fromTo(
          row.querySelectorAll('.wk-label, .wk-book'),
          { y: 34, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.85, stagger: 0.07, ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 85%' },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="wk" ref={root}>
      <SiteHeader />

      <main className="wk-main">
        <header className="wk-head">
          <p className="wk-kicker">Every Week&rsquo;s</p>
          <h1 className="wk-title">Book of the Week</h1>
          <Divider width={300} />
          <p className="wk-sub">
            Handpicked stories that stay with you long after the last page.
          </p>
        </header>

        <div className="wk-list">
          {WEEKS_RESOLVED.map((week) => (
            <section className="wk-week" key={week.id} aria-label={`Books of ${week.label}`}>
              <div className="wk-label">
                <p className="wk-label-kicker">Books of</p>
                <h2>{week.label}</h2>
                <Divider align="left" width={96} />
                <p className="wk-range">{week.range}</p>
              </div>

              <div className="wk-books">
                {week.books.map((b) => {
                  const href = b.href
                  const Card = href ? 'a' : 'div'
                  return (
                    <Card
                      className="wk-book"
                      key={`${week.id}-${b.title}`}
                      {...(href ? { href, 'aria-label': `${b.title} by ${b.author}` } : {})}
                    >
                      <figure className="wk-cover">
                        <img src={b.coverSrc} alt={`${b.title} by ${b.author}`} loading="lazy" />
                      </figure>
                      <h3>{b.title}</h3>
                      <p className="wk-by">by {b.author}</p>
                      <p className="wk-meta">
                        <span className="wk-genre">{b.genre}</span>
                        <i aria-hidden="true" />
                        <span>{b.pages} pages</span>
                      </p>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
