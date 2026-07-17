import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider } from './ui'

const ITEMS = [
  { icon: 'icon-trailers', title: 'Book Trailers', desc: 'Cinematic trailers that bring stories to life.' },
  { icon: 'icon-reviews', title: 'Honest Reviews', desc: 'Real opinions from real readers.' },
  { icon: 'icon-curated', title: 'Curated Books', desc: 'Handpicked books you’ll love.' },
  { icon: 'icon-authors', title: 'Author Features', desc: 'Spotlight on amazing authors.' },
  { icon: 'icon-community', title: 'Community', desc: 'A growing community of book lovers.' },
  { icon: 'icon-updates', title: 'Updates & More', desc: 'Stay updated with new releases.' },
]

export default function Offer() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.offer-head > *',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        },
      )
      gsap.fromTo(
        '.offer-card',
        { y: 46, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out', clearProps: 'transform',
          scrollTrigger: { trigger: '.offer-grid', start: 'top 78%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="offer card" id="offer" ref={root}>
      <div className="offer-head section-head">
        <h2 className="section-title">What We Offer</h2>
        <Divider width={300} />
      </div>
      <div className="offer-grid">
        {ITEMS.map((it) => (
          <article className="offer-card" key={it.title}>
            <div className="offer-icon">
              <img src={`/assets/${it.icon}.png`} alt="" loading="lazy" />
            </div>
            <h3>{it.title}</h3>
            <p>{it.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
