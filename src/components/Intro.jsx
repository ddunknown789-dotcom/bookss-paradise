import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'

const BRAND = 'Books Paradise'

export default function Intro() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = (s) => root.current.querySelector(s)
      const badge = q('.brand-badge')
      const inner = q('.badge-inner')
      const girl = q('.layer-girl')
      const cream = q('.layer-cream')
      const green = q('.layer-green')
      const arc = q('.badge-arc')

      // the fixed badge is centred on the viewport
      gsap.set(badge, { xPercent: -50, yPercent: -50 })

      if (NOANIM) {
        gsap.set([girl, cream, green], { opacity: 1, scale: 1, rotate: 0 })
        gsap.set(['.badge-glow', '.badge-shadow', arc], { opacity: 1 })
        return
      }

      // ---- where the badge parks as the header logo (recomputed on refresh) ----
      const corner = { x: 0, y: 0, scale: 0.11 }
      const measure = () => {
        const size = badge.offsetWidth || 1
        const cs = window.innerWidth <= 680 ? 46 : 54 // header logo diameter
        corner.scale = cs / size
        // park the badge centred on the nav's reserved logo slot
        const slot = document.querySelector('.nav-logo-slot')
        const sr = slot ? slot.getBoundingClientRect() : { left: 30, width: 60 }
        const cx = sr.left + cs / 2 + 2
        const cy = window.innerWidth <= 680 ? 26 : 30
        corner.x = cx - window.innerWidth / 2
        corner.y = cy - window.innerHeight / 2
      }
      measure()

      // ---- initial: only the girl exists; rings + wordmark dismantled ----
      gsap.set(girl, { opacity: 0, scale: 0.72, y: 24, transformOrigin: '50% 50%' })
      gsap.set(cream, { opacity: 0, scale: 0.66, rotate: -18, transformOrigin: '50% 50%' })
      gsap.set(green, { opacity: 0, scale: 0.66, rotate: 16, transformOrigin: '50% 50%' })
      gsap.set(arc, { opacity: 0 })
      gsap.set('.badge-shadow', { opacity: 0, scale: 0.7 })

      // ---- load: the girl blooms into a pure-white frame ----
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.badge-glow', { opacity: 1, scale: 1, duration: 1.6 }, 0)
        .to(girl, { opacity: 1, scale: 1, y: 0, duration: 1.6 }, 0.2)
        .to('.intro-cue', { opacity: 1, duration: 1 }, 1.2)

      gsap.to('.badge-glow', {
        scale: 1.07, duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.8,
      })

      // ---- scroll-scrubbed: assemble the badge, hold, then it shrinks and
      //      travels to the top-left corner where it becomes the header logo. ----
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onRefresh: measure,
        },
      })
      // 1) cream ring spins in, then its wordmark fades on
      tl.to(cream, { opacity: 1, scale: 1, rotate: 0, ease: 'back.out(1.3)', duration: 1 }, 0.3)
        .to(arc, { opacity: 1, ease: 'power2.out', duration: 0.7 }, 0.9)
        // 2) green ring locks in; shadow deepens
        .to(green, { opacity: 1, scale: 1, rotate: 0, ease: 'back.out(1.2)', duration: 1.1 }, 1.5)
        .to('.badge-shadow', { opacity: 1, scale: 1, ease: 'power2.out', duration: 1.1 }, 1.5)
        // 3) small settle of the fully assembled badge
        .to(inner, { scale: 1.045, duration: 0.5, ease: 'power2.out' }, 2.7)
        .to(inner, { scale: 1, duration: 0.45, ease: 'power2.inOut' }, 3.25)
        // 4) HOLD (3.7 → 4.7), then the whole logo glides to the top-left corner
        .to(badge, {
          x: () => corner.x, y: () => corner.y, scale: () => corner.scale,
          xPercent: -50, yPercent: -50, ease: 'power3.inOut', duration: 1.4,
        }, 4.8)
        .to(['.badge-glow', '.badge-shadow'], { opacity: 0, duration: 0.6, ease: 'power2.in' }, 4.8)
        .to('.intro-cue', { opacity: 0, duration: 0.25 }, 0.05)

      // ---- 3D depth: mouse tilt + per-layer parallax (on the inner wrapper so
      //      it never fights the corner-travel transform on .brand-badge) ----
      const rotY = gsap.quickTo(inner, 'rotationY', { duration: 0.7, ease: 'power2.out' })
      const rotX = gsap.quickTo(inner, 'rotationX', { duration: 0.7, ease: 'power2.out' })
      const par = [[girl, 22], [cream, 14], [green, 8]].map(([el, depth]) => ({
        x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power2.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power2.out' }),
        depth,
      }))
      const onMove = (e) => {
        // stop tilting once the logo has parked in the corner
        if (tl.scrollTrigger && tl.scrollTrigger.progress > 0.72) return
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        rotY(nx * 12)
        rotX(-ny * 10)
        par.forEach((l) => { l.x(nx * l.depth); l.y(ny * l.depth) })
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="intro" ref={root} aria-label="Books Paradise">
      <div className="brand-badge">
        <div className="badge-inner">
          <div className="badge-glow" aria-hidden="true" />
          <div className="badge-shadow" aria-hidden="true" />
          <img className="logo-layer layer-green" src="/assets/logo-ring-green.png" alt="" draggable="false" />
          <img className="logo-layer layer-cream" src="/assets/logo-ring-cream.png" alt="" draggable="false" />
          <img className="logo-layer layer-girl" src="/assets/logo-girl.png" alt="Books Paradise" draggable="false" />
          <svg className="badge-arc" viewBox="0 0 1254 1254" aria-hidden="true">
            <defs>
              <path id="bp-arc" d="M 255 640 A 372 372 0 0 1 999 640" fill="none" />
            </defs>
            <text>
              <textPath href="#bp-arc" startOffset="50%" textAnchor="middle">{BRAND}</textPath>
            </text>
            <path className="arc-diamond" d="M 627 968 L 640 995 L 627 1022 L 614 995 Z" />
          </svg>
        </div>
      </div>
      <div className="intro-cue">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
