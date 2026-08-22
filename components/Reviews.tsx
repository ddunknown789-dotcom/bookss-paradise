'use client'

import type { ReviewsContent } from '@/lib/cms/sections'
import type { BookCardView } from '@/lib/cms/types'

export type ReviewBook = BookCardView & { excerpt: string }

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '@/lib/anim'
import { has } from '@/lib/cms/optional'
import { Divider, ArrowRight } from './ui'

export default function Reviews({ content, books }: { content: ReviewsContent; books: ReviewBook[] }) {
  const FEATURED_BOOKS = books
  const root = useRef<any>(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reviews-head > *',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        },
      )
      gsap.fromTo(
        '.review-card',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.reviews-grid', start: 'top 80%' },
        },
      )
      gsap.fromTo(
        '.reviews-cta',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.reviews-grid', start: 'top 55%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="reviews card" id="reviews" ref={root}>
      <div className="reviews-head section-head">
        {has(content.heading) && <h2 className="section-title">{content.heading}</h2>}
        <Divider width={300} />
      </div>
      <div className="reviews-grid">
        {FEATURED_BOOKS.map((book) => (
          <article className="review-card review-book-card" key={book.slug}>
            {has(book.coverSrc) && (
              <div className="review-book-cover">
                <img src={book.coverSrc} alt={has(book.author) ? `${book.title} by ${book.author}` : book.title} loading="lazy" />
              </div>
            )}
            <div className="review-book-content">
              {/* The kicker is genre and author with a dot between them, so it
                  only carries the dot when it has both. */}
              {(has(book.genre) || has(book.author)) && (
                <p className="review-book-kicker">
                  {[book.genre, book.author].filter(has).join(' · ')}
                </p>
              )}
              <h3>{book.title}</h3>
              {has(book.excerpt) && <p className="review-book-excerpt">{book.excerpt}</p>}
              {has(content.readMoreLabel) && (
                <a className="review-book-link" href={`${book.href}/review`}>
                  {content.readMoreLabel} <ArrowRight size={17} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="reviews-cta">
        {has(content.cta.label) && has(content.cta.href) && (
          <a className="btn btn-gold-bright btn-morereviews" href={content.cta.href}>
            {content.cta.label} <ArrowRight size={20} />
          </a>
        )}
        <div className="review-dots" aria-hidden="true">
          <i className="on" />
          <i />
          <i />
        </div>
      </div>
    </section>
  )
}
