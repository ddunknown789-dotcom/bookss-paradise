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
        // Park the badge on the nav's reserved logo slot so the logo and the
        // burger sit on exactly the same line. The vertical centre is derived
        // from the nav's LAYOUT box (padding + row height) rather than a
        // getBoundingClientRect, because the nav is shifted by a translateY
        // while it's hidden — offsetHeight/padding are transform-independent.
        const navEl = document.querySelector('.nav')
        const navInner = document.querySelector('.nav-inner')
        const slot = document.querySelector('.nav-logo-slot')
        const sr = slot ? slot.getBoundingClientRect() : { left: 30 }
        const padTop = navEl ? parseFloat(getComputedStyle(navEl).paddingTop) || 22 : 22
        const rowH = navInner ? navInner.offsetHeight : 54
        const cx = sr.left + cs / 2 + 2
        const cy = padTop + rowH / 2
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
      // Timeline is 10 units long and maps 1:1 onto the spacer's scroll range.
      // The spacer is 250vh and `end: bottom top` means progress 0.6 is exactly
      // the moment the hero's top edge reaches the bottom of the viewport — so
      // starting the corner-travel at 6.0 makes the logo move and the hero
      // reveal happen together, finishing together at progress 1.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onRefresh: measure,
        },
      })
      // --- ASSEMBLY (progress 0 → 0.6) ---
      tl.to(cream, { opacity: 1, scale: 1, rotate: 0, ease: 'back.out(1.3)', duration: 2 }, 0.8)
        .to(arc, { opacity: 1, ease: 'power2.out', duration: 1.2 }, 2.0)
        .to(green, { opacity: 1, scale: 1, rotate: 0, ease: 'back.out(1.2)', duration: 2.2 }, 3.0)
        .to('.badge-shadow', { opacity: 1, scale: 1, ease: 'power2.out', duration: 2.2 }, 3.0)
        // gentle settle that flows straight into the travel (no dead pause)
        .to(inner, { scale: 1.035, duration: 0.6, ease: 'power2.out' }, 4.9)
        .to(inner, { scale: 1, duration: 0.5, ease: 'power2.inOut' }, 5.5)
        // --- TRAVEL TO HEADER (progress 0.6 → 1.0), in step with the hero ---
        // x / y / scale are separate tweens with different eases so the logo
        // follows a soft organic arc instead of a straight mechanical line.
        .to(badge, { y: () => corner.y, ease: 'power1.inOut', duration: 4 }, 6.0)
        .to(badge, { x: () => corner.x, ease: 'power3.inOut', duration: 4 }, 6.0)
        .to(badge, { scale: () => corner.scale, ease: 'power2.inOut', duration: 4 }, 6.0)
        .to(['.badge-glow', '.badge-shadow'], { opacity: 0, duration: 2, ease: 'power2.in' }, 6.0)
        .to('.intro-cue', { opacity: 0, duration: 0.5 }, 0.2)

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
              {/* baseline arc: centred on the ACTUAL ring centre (625,620) with
                  r=330 — measured from the original logo, whose text ink spans
                  radius 330→399. Glyphs extend outward from the baseline. */}
              <path id="bp-arc" d="M 295 620 A 330 330 0 0 1 955 620" fill="none" />
            </defs>
            <text>
              <textPath href="#bp-arc" startOffset="50%" textAnchor="middle">{BRAND.toUpperCase()}</textPath>
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
