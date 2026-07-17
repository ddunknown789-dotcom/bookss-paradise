import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider, Star4 } from './ui'

const STATS = [
  { target: 10, suffix: 'K+', label: 'Happy Readers' },
  { target: 500, suffix: '+', label: 'Books Featured' },
  { target: 100, suffix: '+', label: 'Authors Spotlighted' },
]

export default function Mission() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.mission-copy > *',
        { y: 34, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%' },
        },
      )
      gsap.fromTo(
        '.mission-art img',
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.15, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%' },
        },
      )
      // count-up stats
      gsap.utils.toArray('.stat-num').forEach((el) => {
        const target = Number(el.dataset.target)
        const suffix = el.dataset.suffix
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.mission-stats', start: 'top 82%' },
          onUpdate: () => {
            el.textContent = Math.round(obj.v) + suffix
          },
        })
      })
      gsap.fromTo(
        '.mission-art img',
        { yPercent: 4 },
        {
          yPercent: -4, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="mission card" id="about" ref={root}>
      <div className="mission-inner">
        <div className="mission-copy">
          <h2 className="section-title">Our Mission</h2>
          <Divider align="left" width={320} />
          <p className="mission-text">
            @Bookss.Paradise is more than just a page – it’s a paradise for readers. Our mission is to connect
            people with stories that inspire, heal, and transform.
          </p>
          <div className="mission-stats">
            {STATS.map((s) => (
              <div className="stat" key={s.label}>
                <span className="stat-num" data-target={s.target} data-suffix={s.suffix}>
                  {NOANIM ? `${s.target}${s.suffix}` : `0${s.suffix}`}
                </span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <figure className="mission-art">
          <span className="sparkle m-sp1"><Star4 size={18} color="#D9A22E" /></span>
          <span className="sparkle m-sp2"><Star4 size={11} color="#D9A22E" /></span>
          <span className="sparkle m-sp3"><Star4 size={14} color="#D9A22E" /></span>
          <img src="/assets/model/model-mission.png" alt="Reader sitting beside stacks of classic books" loading="lazy" />
        </figure>
      </div>
    </section>
  )
}
