import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Star4 } from './ui'
import OfferEmblem, { BookOrnament } from './OfferIcons'

// Title lines are authored per line so the cards break exactly as designed;
// they still wrap naturally once the grid narrows.
const SERVICES = [
  {
    glyph: 'social',
    title: ['Book Features on', 'Instagram, FB,', 'Website & YouTube'],
    desc: 'Showcase your book to a wider audience across top platforms and drive real engagement.',
  },
  {
    glyph: 'pen',
    title: ['Honest', 'Book Reviews'],
    desc: 'Genuine, in-depth reviews that build trust and help readers make their next favorite read.',
  },
  {
    glyph: 'film',
    title: ['Cinematic', 'Video Content', 'of Book'],
    desc: 'High-quality, cinematic videos that capture your book’s essence and leave a lasting impression.',
  },
  {
    glyph: 'website',
    title: ['Website', 'Creation'],
    desc: 'Professional, author-focused websites that establish your online presence and connect you with readers.',
  },
  {
    glyph: 'author',
    title: ['Author', 'Features'],
    desc: 'Highlighting authors, their journey, and their stories to connect with readers on a deeper level.',
  },
  {
    glyph: 'blog',
    title: ['Book', 'Blogs'],
    desc: 'Engaging blog posts that inform, inspire, and bring more visibility to your book and brand.',
  },
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
        { y: 44, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.85, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: '.offer-grid', start: 'top 85%' },
        },
      )
      gsap.fromTo(
        '.offer-foot',
        { opacity: 0 },
        {
          opacity: 1, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: '.offer-foot', start: 'top 95%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="offer card" id="offer" ref={root}>
      <div className="offer-head">
        <p className="offer-kicker">
          <i aria-hidden="true" />
          <span>Explore Our Services</span>
          <i aria-hidden="true" />
        </p>
        <h2 className="offer-title">What We Offer</h2>
        <div className="offer-rule" aria-hidden="true">
          <i />
          <Star4 size={15} color="#C39A3E" />
          <i />
        </div>
        {/* two spans, not a <br>: the authored break becomes a plain space
            once the lines are set inline on narrow screens */}
        <p className="offer-sub">
          <span>Premium book promotion and content services</span>{' '}
          <span>designed to bring stories to life.</span>
        </p>
      </div>

      <div className="offer-grid">
        {SERVICES.map((s) => (
          <article className="offer-card" key={s.glyph}>
            <span className="offer-card-emblem">
              <OfferEmblem glyph={s.glyph} />
            </span>
            <h3 className="offer-card-title">
              {s.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h3>
            <span className="offer-card-rule" aria-hidden="true">
              <i />
              <Star4 size={10} color="#C39A3E" />
              <i />
            </span>
            <p className="offer-card-desc">{s.desc}</p>
          </article>
        ))}
      </div>

      <div className="offer-foot">
        <div className="offer-foot-rule" aria-hidden="true">
          <i />
          <Star4 size={12} color="#C39A3E" />
          <BookOrnament size={34} />
          <Star4 size={12} color="#C39A3E" />
          <i />
        </div>
        <p className="offer-foot-text">Stories connect. We make them unforgettable.</p>
      </div>
    </section>
  )
}
