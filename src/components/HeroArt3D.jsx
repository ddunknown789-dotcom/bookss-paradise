import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM, IS_SMALL } from '../lib/anim'
import { Star4 } from './ui'

// Gold sparks scattered around the diorama at different depths — under the
// mouse tilt they parallax against the artwork, selling real 3D.
const SPARKS = [
  { left: '7%', top: '16%', size: 18, z: 60, delay: 0 },
  { left: '2%', top: '56%', size: 12, z: -40, delay: 0.9 },
  { left: '91%', top: '24%', size: 16, z: 45, delay: 0.4 },
  { left: '95%', top: '55%', size: 11, z: 80, delay: 1.3 },
  { left: '84%', top: '6%', size: 13, z: -60, delay: 1.7 },
  { left: '15%', top: '3%', size: 10, z: 30, delay: 2.1 },
]

export default function HeroArt3D() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      const stage = root.current.querySelector('.hero3d-stage')

      // Gentle levitation; the contact shadow breathes in counterpoint so the
      // motion reads as depth rather than drift.
      gsap.to('.hero3d-float', {
        y: -11, rotation: 0.5, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut',
      })
      gsap.to('.hero3d-shadow', {
        scaleX: 0.9, opacity: 0.65, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut',
      })

      // Recurring light sweep across the illustration (masked to its alpha,
      // so the shine only ever crosses the artwork itself).
      gsap.fromTo(
        '.hero3d-sheen i',
        { xPercent: -280 },
        { xPercent: 320, duration: 2.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.4, delay: 2.2 },
      )

      // Mouse-tracked perspective tilt (desktop only) — the aura, artwork and
      // sparks sit at different translateZ depths inside this stage.
      if (!IS_SMALL) {
        const rx = gsap.quickTo(stage, 'rotationX', { duration: 0.9, ease: 'power2.out' })
        const ry = gsap.quickTo(stage, 'rotationY', { duration: 0.9, ease: 'power2.out' })
        const onMove = (e) => {
          const r = root.current.getBoundingClientRect()
          const nx = (e.clientX - (r.left + r.width / 2)) / r.width
          const ny = (e.clientY - (r.top + r.height / 2)) / r.height
          ry(gsap.utils.clamp(-13, 13, nx * 11))
          rx(gsap.utils.clamp(-10, 10, -ny * 8))
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
      }
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="hero3d" ref={root}>
      <div className="hero3d-stage">
        <span className="hero3d-aura" aria-hidden="true" />
        <div className="hero3d-float">
          <img
            src="/assets/model/model-hero.png"
            alt="Reader with a book at a café table surrounded by stacks of books"
          />
          {!NOANIM && (
            <span className="hero3d-sheen" aria-hidden="true"><i /></span>
          )}
        </div>
        <span className="hero3d-shadow" aria-hidden="true" />
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="hero3d-spark"
            style={{ left: s.left, top: s.top, transform: `translateZ(${s.z}px)` }}
            aria-hidden="true"
          >
            <span className="sparkle-anim" style={{ animationDelay: `${s.delay}s` }}>
              <Star4 size={s.size} color="#D9A22E" />
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
