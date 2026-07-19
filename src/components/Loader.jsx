import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const BRAND = 'BOOKS PARADISE'

// Real assets gate the progress bar — the counter reflects actual loading,
// not a made-up timer, so the reveal lands exactly when the site is ready.
const ASSETS = [
  '/assets/logo-girl.png',
  '/assets/logo-ring-cream.png',
  '/assets/logo-ring-green.png',
  '/assets/model/model-hero.png',
]

const R = 64
const CIRC = 2 * Math.PI * R
const MIN_MS = 1800 // never flash by — the reveal deserves to be seen

export default function Loader({ onReveal, onDone }) {
  const root = useRef(null)
  const countRef = useRef(null)
  const arcRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const started = performance.now()
      const state = { v: 0 }

      // ---- paint progress straight to the DOM (no re-render per frame) ----
      const paint = () => {
        const p = state.v
        if (countRef.current) countRef.current.textContent = String(Math.round(p * 100)).padStart(2, '0')
        if (arcRef.current) arcRef.current.style.strokeDashoffset = String(CIRC * (1 - p))
      }
      paint()

      const to = (target, dur = 0.6) =>
        gsap.to(state, { v: target, duration: dur, ease: 'power2.out', onUpdate: paint })

      // ---- entrance ----
      gsap.set('.ld-letter', { yPercent: 120, opacity: 0 })
      gsap.timeline()
        .to('.ld-ring', { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, 0)
        .to('.ld-count', { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.25)
        .to('.ld-letter', { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.035, ease: 'power4.out' }, 0.3)
        .to('.ld-sub', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.8)

      // ---- real asset preloading ----
      let done = 0
      const total = ASSETS.length + 1 // +1 for fonts
      const step = () => {
        done += 1
        to(Math.min(done / total, 1))
        if (done >= total) finish()
      }
      ASSETS.forEach((src) => {
        const img = new Image()
        img.onload = step
        img.onerror = step // never stall the site on a bad asset
        img.src = src
      })
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
      fonts.then(step).catch(step)

      // ---- exit: a cross-dissolve, because the site behind is also white ----
      // ?loader keeps the screen up so its design can be reviewed without
      // racing a hard reload.
      const HOLD = new URLSearchParams(window.location.search).has('loader')

      let finished = false
      const finish = () => {
        if (finished || HOLD) return
        finished = true
        const wait = Math.max(0, MIN_MS - (performance.now() - started))
        gsap.delayedCall(wait / 1000, () => {
          gsap.timeline()
            .to(state, { v: 1, duration: 0.4, ease: 'power2.out', onUpdate: paint }, 0)
            // content leaves first
            .to('.ld-count', { opacity: 0, scale: 0.9, duration: 0.45, ease: 'power2.in' }, 0.35)
            .to('.ld-ring', { scale: 1.14, opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0.35)
            .to('.ld-letter', { yPercent: -110, opacity: 0, duration: 0.6, stagger: 0.022, ease: 'power3.in' }, 0.4)
            .to('.ld-sub', { opacity: 0, duration: 0.4 }, 0.4)
            // a single gold filament sweeps the seam as the sheet lets go
            .fromTo('.ld-sweep', { scaleX: 0, opacity: 0 },
              { scaleX: 1, opacity: 1, duration: 0.55, ease: 'power3.inOut' }, 0.75)
            .to('.ld-sweep', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 1.2)
            // mount the site NOW so its logo blooms through the dissolve
            .add(() => onReveal && onReveal(), 0.95)
            .to(root.current, { opacity: 0, scale: 1.035, duration: 0.9, ease: 'power2.inOut' }, 1.0)
            .add(() => onDone && onDone())
        })
      }
    }, root)
    return () => ctx.revert()
  }, [onReveal, onDone])

  return (
    <div className="ld" ref={root} role="status" aria-live="polite" aria-label="Loading Books Paradise">
      <span className="ld-glow" aria-hidden="true" />

      <div className="ld-ring" aria-hidden="true">
        <svg viewBox="0 0 160 160">
          <circle className="ld-track" cx="80" cy="80" r={R} />
          <circle
            className="ld-arc"
            ref={arcRef}
            cx="80" cy="80" r={R}
            style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC }}
          />
        </svg>
        <span className="ld-count" ref={countRef}>00</span>
      </div>

      <h1 className="ld-word" aria-hidden="true">
        {BRAND.split('').map((ch, i) => (
          <span className="ld-letter-wrap" key={i}>
            <span className="ld-letter">{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </h1>
      <p className="ld-sub" aria-hidden="true">Stories that stay with you forever</p>

      <span className="ld-sweep" aria-hidden="true" />
    </div>
  )
}
