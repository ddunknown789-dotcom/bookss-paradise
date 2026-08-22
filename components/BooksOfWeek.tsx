'use client'

import type { BookOfWeekContent } from '@/lib/cms/sections'
import type { WeekView } from '@/lib/cms/types'

import { Fragment, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '@/lib/anim'
import { has, hasList, hasNum } from '@/lib/cms/optional'
import { Divider, ArrowRight } from './ui'

/* The homepage "Book of the Week" shelf. Content comes entirely from the
   first week in the CMS — manage them under Admin → Book of the Week
   follows automatically. */

export default function BooksOfWeek({ content, week }: { content: BookOfWeekContent; week: WeekView | null }) {
  const root = useRef<any>(null)
  const books = week?.books ?? []

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.botw-head > *',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        },
      )
      // Covers rise into place, tilted a hair so they settle rather than snap.
      gsap.fromTo(
        '.botw-cover',
        { y: 70, opacity: 0, rotateZ: -1.5 },
        {
          y: 0, opacity: 1, rotateZ: 0, duration: 0.95, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: '.botw-stage', start: 'top 80%' },
        },
      )
      gsap.fromTo(
        '.botw-caption',
        { y: 18, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: '.botw-stage', start: 'top 62%' },
        },
      )
      gsap.fromTo(
        '.botw-cta',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.botw-stage', start: 'top 52%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  // Both rows are driven off the same count so the captions stay locked to
  // the covers above them at any width.
  const cols = { '--botw-cols': books.length } as React.CSSProperties

  return (
    <section className="botw card" id="book-of-the-week" ref={root}>
      <div className="botw-head section-head">
        {has(content.heading) && <h2 className="section-title">{content.heading}</h2>}
        <Divider width={300} />
        {has(content.subheading) && <p className="botw-sub">{content.subheading}</p>}
      </div>

      <div className="botw-stage" style={cols}>
        <div className="botw-row">
          {books.map((b) => {
            const href = b.href
            // Only titles that have their own page become links; the rest
            // stay as plain cards so nothing dead-ends.
            const Cover = href ? 'a' : 'div'
            const label = has(b.author) ? `${b.title} by ${b.author}` : b.title
            // Only the facts this entry carries; the separators follow suit.
            const facts = [
              { label: 'Genre', value: b.genre },
              { label: 'Pages', value: hasNum(b.pages) ? String(b.pages) : '' },
              { label: 'Published', value: b.published },
            ].filter((f) => has(f.value))
            return (
              <figure className="botw-book" key={b.title}>
                {has(b.coverSrc) && (
                  <Cover
                    className="botw-cover"
                    {...(href ? { href, 'aria-label': label } : {})}
                  >
                    <img src={b.coverSrc} alt={label} loading="lazy" />
                  </Cover>
                )}

                <figcaption className="botw-caption">
                  <h3>{b.title}</h3>
                  {has(b.author) && <p className="botw-by">by {b.author}</p>}
                  {facts.length > 0 && (
                    <p className="botw-meta">
                      {facts.map((f, i) => (
                        <Fragment key={f.label}>
                          {i > 0 && <i aria-hidden="true" />}
                          <span><em>{f.label}:</em> {f.value}</span>
                        </Fragment>
                      ))}
                    </p>
                  )}
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>

      {has(content.cta.label) && has(content.cta.href) && (
        <div className="botw-cta">
          <a className="btn btn-gold-bright btn-botw" href={content.cta.href}>
            {content.cta.label} <ArrowRight size={20} />
          </a>
        </div>
      )}
    </section>
  )
}
