import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider, ArrowRight } from './ui'
import { CURRENT_WEEK, weekBookHref, WEEKS_HREF } from '../data/weeks'

/* The homepage "Book of the Week" shelf. Content comes entirely from the
   first entry in src/data/weeks.js — add a new week there and this section
   follows automatically. */

export default function BooksOfWeek() {
  const root = useRef(null)
  const books = CURRENT_WEEK.books

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
  const cols = { '--botw-cols': books.length }

  return (
    <section className="botw card" id="book-of-the-week" ref={root}>
      <div className="botw-head section-head">
        <h2 className="section-title">Book of the Week</h2>
        <Divider width={300} />
        <p className="botw-sub">
          Handpicked stories that stay with you long after the last page.
        </p>
      </div>

      <div className="botw-stage" style={cols}>
        <div className="botw-row">
          {books.map((b) => {
            const href = weekBookHref(b)
            // Only titles that have their own page become links; the rest
            // stay as plain cards so nothing dead-ends.
            const Cover = href ? 'a' : 'div'
            return (
              <figure className="botw-book" key={b.title}>
                <Cover
                  className="botw-cover"
                  {...(href ? { href, 'aria-label': `${b.title} by ${b.author}` } : {})}
                >
                  <img src={b.coverSrc} alt={`${b.title} by ${b.author}`} loading="lazy" />
                </Cover>

                <figcaption className="botw-caption">
                  <h3>{b.title}</h3>
                  <p className="botw-by">by {b.author}</p>
                  <p className="botw-meta">
                    <span><em>Genre:</em> {b.genre}</span>
                    <i aria-hidden="true" />
                    <span><em>Pages:</em> {b.pages}</span>
                    <i aria-hidden="true" />
                    <span><em>Published:</em> {b.published}</span>
                  </p>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>

      <div className="botw-cta">
        <a className="btn btn-gold-bright btn-botw" href={WEEKS_HREF}>
          View All Weeks' Book of the Week <ArrowRight size={20} />
        </a>
      </div>
    </section>
  )
}
