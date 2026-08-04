import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider, ArrowRight } from './ui'
import { BOOKS, bookHref } from '../data/books'

// The homepage features the first six books in the shared data source.
const FEATURED_BOOKS = BOOKS.slice(0, 6)

export default function Reviews() {
  const root = useRef(null)

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
        <h2 className="section-title">Latest Book Reviews</h2>
        <Divider width={300} />
      </div>
      <div className="reviews-grid">
        {FEATURED_BOOKS.map((book) => (
          <article className="review-card review-book-card" key={book.slug}>
            <div className="review-book-cover">
              <img src={book.coverSrc} alt={`${book.title} by ${book.author}`} loading="lazy" />
            </div>
            <div className="review-book-content">
              <p className="review-book-kicker">{book.genre} · {book.author}</p>
              <h3>{book.title}</h3>
              <p className="review-book-excerpt">{book.review.text}</p>
              <a className="review-book-link" href={`${bookHref(book)}/review`}>
                Read Full Review <ArrowRight size={17} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="reviews-cta">
        <a className="btn btn-gold-bright btn-morereviews" href="#reviews">
          Read More Reviews <ArrowRight size={20} />
        </a>
        <div className="review-dots" aria-hidden="true">
          <i className="on" />
          <i />
          <i />
        </div>
      </div>
    </section>
  )
}
