import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider, ArrowRight, Star4 } from './ui'
import HeroArt3D from './HeroArt3D'

export default function Hero() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      // Fires the instant the hero's top edge peeks into the viewport, which is
      // the same moment the intro logo starts travelling to the header — so the
      // section reveals progressively *while* the logo moves, with no dead gap.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 97%' },
      })
      tl.fromTo('.hl .line > span', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.14, ease: 'power4.out' })
        .fromTo('.hero .divider', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.55')
        .fromTo('.hero-sub', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.45')
        .fromTo('.hero-cta > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, '-=0.5')
      // The model's own entrance is handled inside <HeroArt3D> with its own
      // scroll-scrubbed reveal (see that component) — it starts at the same
      // 'top 97%' trigger point as this timeline, so both begin together.

      // soft parallax on the illustration while scrolling through
      gsap.fromTo(
        '.hero-art img',
        { yPercent: 5 },
        {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero card" id="home" ref={root}>
      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hl">
            <span className="line"><span>Stories That Stay</span></span>
            <span className="line"><span>With You Forever</span></span>
          </h1>
          <span className="sparkle hero-sp1"><Star4 size={20} color="#D9A22E" /></span>
          <span className="sparkle hero-sp2"><Star4 size={12} color="#D9A22E" /></span>
          <Divider align="center" width={430} />
          <p className="hero-sub">
            Dive into handpicked books, cinematic trailers, honest reviews, and a community that lives for stories.
          </p>
          <div className="hero-cta">
            <a className="btn btn-gold btn-explore" href="#books">Explore Now</a>
            <a className="link-more" href="#about">
              Learn More <ArrowRight size={22} />
            </a>
          </div>
        </div>
        <figure className="hero-art">
          <HeroArt3D />
        </figure>
      </div>
    </section>
  )
}
