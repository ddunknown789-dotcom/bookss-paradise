import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider, ArrowRight } from './ui'

const REVIEWS = [
  { avatar: 'avatar-1', name: 'Ananya D.', quote: 'A beautifully written story. The emotions felt so real!' },
  { avatar: 'avatar-2', name: 'Rohan M.', quote: 'Couldn’t put it down! The trailer made me read it instantly.' },
  { avatar: 'avatar-3', name: 'Neha S.', quote: 'One of the best books I’ve read this year. Highly recommended!' },
]

function Stars() {
  return (
    <span className="stars" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
          <path
            d="M12 1.8L14.9 8.1L21.8 8.9L16.7 13.6L18.1 20.4L12 17L5.9 20.4L7.3 13.6L2.2 8.9L9.1 8.1L12 1.8Z"
            fill="#E0A32E"
          />
        </svg>
      ))}
    </span>
  )
}

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
        <h2 className="section-title">Latest Reviews</h2>
        <Divider width={300} />
      </div>
      <div className="reviews-grid">
        {REVIEWS.map((r) => (
          <article className="review-card" key={r.name}>
            <div className="review-head">
              <img className="review-avatar" src={`/assets/${r.avatar}.jpg`} alt={r.name} loading="lazy" />
              <div>
                <h3>{r.name}</h3>
                <Stars />
              </div>
            </div>
            <p>{r.quote}</p>
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
