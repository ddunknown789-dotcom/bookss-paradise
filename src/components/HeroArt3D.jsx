import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Star4 } from './ui'

// Gold sparks scattered around the diorama at different depths — under the
// tilt they parallax against the artwork, selling real 3D.
const SPARKS = [
  { left: '7%', top: '16%', size: 18, z: 60, delay: 0 },
  { left: '2%', top: '56%', size: 12, z: -40, delay: 0.9 },
  { left: '91%', top: '24%', size: 16, z: 45, delay: 0.4 },
  { left: '95%', top: '55%', size: 11, z: 80, delay: 1.3 },
  { left: '84%', top: '6%', size: 13, z: -60, delay: 1.7 },
  { left: '15%', top: '3%', size: 10, z: 30, delay: 2.1 },
]

const MAX_TILT = 4 // degrees — subtle, per spec

export default function HeroArt3D() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const stage = root.current.querySelector('.hero3d-stage')
      const float = root.current.querySelector('.hero3d-float')
      const aura = root.current.querySelector('.hero3d-aura')
      const shadow = root.current.querySelector('.hero3d-shadow')
      const sparks = root.current.querySelectorAll('.hero3d-spark')

      let ambientStarted = false
      const startAmbient = () => {
        if (ambientStarted) return
        ambientStarted = true
        // Gentle levitation; the contact shadow breathes in counterpoint so the
        // motion reads as depth rather than drift.
        gsap.to(float, { y: -11, rotation: 0.5, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
        gsap.to(shadow, { scaleX: 0.9, opacity: 0.65, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
        // Recurring light sweep across the illustration (masked to its alpha,
        // so the shine only ever crosses the artwork itself).
        const sheen = root.current.querySelector('.hero3d-sheen i')
        if (sheen) {
          gsap.fromTo(sheen, { xPercent: -280 }, { xPercent: 320, duration: 2.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.4, delay: 0.4 })
        }
      }

      if (NOANIM) {
        gsap.set([aura, float, shadow, ...sparks], { opacity: 1, scale: 1, y: 0, filter: 'none' })
        startAmbient()
      } else {
        // ---- premium staged reveal, driven by scroll (not a timer) so it
        //      never "pops" — it fills in exactly as far as you've scrolled,
        //      starting the instant Slide 1's text starts revealing. ----
        gsap.set(aura, { opacity: 0, scale: 0.82 })
        // A big blur radius is costly to re-rasterise every scrub frame, so
        // phones get a lighter one — same look, far cheaper.
        const startBlur = window.innerWidth <= 680 ? 9 : 18
        gsap.set(float, { opacity: 0, scale: 0.85, y: 30, filter: `blur(${startBlur}px)` })
        gsap.set(shadow, { opacity: 0, scaleX: 0.55 })
        gsap.set(sparks, { opacity: 0, scale: 0.3 })

        // NOTE: 'top 97%' (used elsewhere for the text sync) only shows a ~3%
        // sliver of a tall element when the reveal starts, so it visibly
        // finishes before the user has scrolled far enough to actually SEE
        // it. Starting later (top 65%) means roughly a third of the diorama
        // is already on screen when the fade-in begins, and stretching the
        // end further (top 6%) gives it a generous scroll distance to
        // unfold while it's genuinely in view.
        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top 65%',
            end: 'top 6%',
            scrub: 0.7,
            onLeave: startAmbient,
          },
        })
        reveal
          .to(aura, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 0)
          .to(float, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out' }, 0.15)
          .to(shadow, { opacity: 1, scaleX: 1, duration: 1.2, ease: 'power2.out' }, 0.55)
          .to(sparks, { opacity: 1, scale: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(2)' }, 0.65)
      }

      // ---- interactive tilt: hover (mouse) AND touch, via unified Pointer
      //      Events, scoped to the diorama itself. Tilts up to MAX_TILT toward
      //      the interaction point, then eases back to rest when it ends. ----
      const rx = gsap.quickTo(stage, 'rotationX', { duration: 0.5, ease: 'power2.out' })
      const ry = gsap.quickTo(stage, 'rotationY', { duration: 0.5, ease: 'power2.out' })

      const applyTilt = (e) => {
        const r = stage.getBoundingClientRect()
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
        ry(gsap.utils.clamp(-MAX_TILT, MAX_TILT, nx * MAX_TILT))
        rx(gsap.utils.clamp(-MAX_TILT, MAX_TILT, -ny * MAX_TILT))
      }
      const resetTilt = () => {
        gsap.to(stage, { rotationX: 0, rotationY: 0, duration: 0.7, ease: 'power2.out' })
      }

      // A finger that merely scrolls PAST the artwork also emits pointermove,
      // which used to tilt it mid-scroll. So on touch we only tilt while the
      // user is deliberately pressing on it.
      let pressed = false
      const onPointerMove = (e) => {
        if (e.pointerType === 'touch' && !pressed) return
        applyTilt(e)
      }
      const onPointerDown = (e) => {
        if (e.pointerType === 'touch') { pressed = true; applyTilt(e) }
      }
      const endInteraction = () => { pressed = false; resetTilt() }

      const el = root.current
      el.addEventListener('pointermove', onPointerMove)
      el.addEventListener('pointerdown', onPointerDown)
      el.addEventListener('pointerleave', endInteraction)
      // pointerup/cancel are bound to the WINDOW: lifting the finger outside
      // the artwork never fires pointerleave on it, which previously left the
      // model stuck at an angle forever.
      window.addEventListener('pointerup', endInteraction)
      window.addEventListener('pointercancel', endInteraction)
      return () => {
        el.removeEventListener('pointermove', onPointerMove)
        el.removeEventListener('pointerdown', onPointerDown)
        el.removeEventListener('pointerleave', endInteraction)
        window.removeEventListener('pointerup', endInteraction)
        window.removeEventListener('pointercancel', endInteraction)
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
