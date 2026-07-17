import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider, ArrowRight } from './ui'

const BOOKS = [
  { img: 'book-1', title: 'The Silent Page — Lucas Elliot' },
  { img: 'book-2', title: 'The Beyond The Horizon — Nora Elston' },
  { img: 'book-3', title: 'The Lost Letters — Madilyn Hart' },
  { img: 'book-4', title: 'The Whispers of the Past — Clara Bennett' },
  { img: 'book-5', title: 'The Light Between Worlds — Anna Shah' },
]

export default function TopPicks() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.picks-head > *',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        },
      )
      gsap.fromTo(
        '.pick-book',
        { y: 70, opacity: 0, rotateZ: -1.5 },
        {
          y: 0, opacity: 1, rotateZ: 0, duration: 0.95, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: '.picks-shelf-zone', start: 'top 80%' },
        },
      )
      gsap.fromTo(
        '.picks-shelf',
        { scaleX: 0.6, opacity: 0 },
        {
          scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.picks-shelf-zone', start: 'top 80%' },
        },
      )
      gsap.fromTo(
        '.picks-cta',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.picks-shelf-zone', start: 'top 60%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="picks card" id="books" ref={root}>
      <div className="picks-head section-head">
        <h2 className="section-title">Top Picks for You</h2>
        <Divider width={300} />
      </div>
      <div className="picks-shelf-zone">
        <div className="picks-row">
          {BOOKS.map((b) => (
            <figure className="pick-book" key={b.img}>
              <img src={`/assets/${b.img}.png`} alt={b.title} loading="lazy" />
            </figure>
          ))}
        </div>
        <img className="picks-shelf" src="/assets/shelf.png" alt="" loading="lazy" />
      </div>
      <div className="picks-cta">
        <a className="btn btn-gold-bright btn-viewall" href="#books">
          View All Books <ArrowRight size={20} />
        </a>
      </div>
    </section>
  )
}
