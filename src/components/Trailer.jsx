import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'

export default function Trailer() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.current,
        { scale: 0.965, opacity: 0, y: 40 },
        {
          scale: 1, opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 78%' },
        },
      )
      gsap.fromTo(
        '.trailer-copy > *',
        { y: 34, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 65%' },
        },
      )
      gsap.fromTo(
        '.trailer-art img',
        { xPercent: 3, scale: 1.05 },
        {
          xPercent: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="trailer" id="trailers" ref={root}>
      <div className="trailer-copy">
        <h2>
          Cinematic<br />Book Trailers
        </h2>
        <p>Experience the power of stories through high-quality, cinematic book trailers.</p>
        <a className="btn btn-gold-bright btn-watch" href="#trailers">
          Watch Trailer
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M8 5.5V18.5L19 12L8 5.5Z" fill="#161616" />
          </svg>
        </a>
      </div>
      <div className="trailer-art">
        <img src="/assets/trailer-right.jpg" alt="The Beyond The Horizon by Nora Elston on a glowing golden podium" loading="lazy" />
        <span className="play-ring" aria-hidden="true" />
      </div>
    </section>
  )
}
