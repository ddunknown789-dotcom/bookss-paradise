'use client'

import { Fragment, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '@/lib/anim'
import { ORG } from '@/lib/site'
import type { SocialLinkView } from '@/lib/cms/types'

const BRAND = 'Books Paradise'

// The three copy beats that reveal under the badge, one per scroll beat.
const PROMISE = 'Paradise is a library of stories waiting to be read.'
const KICKER = 'Discover, Read, & Love Books'

/** Splits a line into masked words — the same reveal idiom as the hero headline. */
const words = (line: string) =>
  line.split(' ').map((w, i) => (
    <Fragment key={`${w}-${i}`}>
      {i > 0 && ' '}
      <span className="il-w"><span>{w}</span></span>
    </Fragment>
  ))

/**
 * Outline container + filled mark, so the three read as one set rather than
 * three borrowed brand glyphs. Instagram and Facebook share the same rounded
 * square; YouTube keeps its wider plate because that shape *is* the logo.
 */
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      {/* the footer's "f", scaled to sit inside the plate and land on its floor */}
      <g transform="translate(2.05 2.67) scale(0.833)" fill="currentColor" stroke="none">
        <path d="M14.5 8.5h2.2V5.2h-2.6c-2.8 0-4.4 1.7-4.4 4.6v2.1H7.2v3.4h2.5V22h3.6v-6.7h2.6l.5-3.4h-3.1V9.9c0-1 .4-1.4 1.2-1.4z" />
      </g>
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.4v5.2l4.6-2.6z" fill="currentColor" stroke="none" />
    </>
  ),
}

/** The accounts the intro shows, in order, with the name screen readers hear. */
const SOCIAL_ORDER = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['youtube', 'YouTube'],
] as const

/**
 * Display text is fixed in `lib/site.ts`; the URL comes from the CMS
 * `social_links` row for that platform when there is one, so an editor can set
 * or change a link under /admin/footer → Social accounts without a deploy.
 * An account with no URL yet renders as plain text instead of a dead link.
 */
const resolveSocials = (rows: SocialLinkView[] = []) =>
  SOCIAL_ORDER.map(([platform, name]) => {
    const cms = rows.find((r) => r.platform.toLowerCase() === platform)
    const fallback = ORG.social[platform]
    return {
      platform,
      name,
      label: fallback.handle,
      url: (cms?.url || fallback.url || '').trim(),
    }
  })

export default function Intro({ socials }: { socials?: SocialLinkView[] }) {
  const root = useRef<any>(null)
  const accounts = resolveSocials(socials)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = (s: any) => root.current.querySelector(s)
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
        // The copy sits where the "Scroll" cue does, and with animation off the
        // cue never fades — so drop the cue rather than let the two collide.
        gsap.set(['.il', '.il-dot', '.il-soc', '.il-soc-ic'], { autoAlpha: 1, scale: 1, y: 0 })
        gsap.set('.il-w > span', { yPercent: 0 })
        gsap.set('.intro-cue', { autoAlpha: 0 })
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
        const rowH = navInner ? (navInner as HTMLElement).offsetHeight : 54
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

      // ---- initial: the three copy beats are parked below the badge, each one
      //      masked word-by-word so it can rise into view on its own beat ----
      gsap.set('.il', { autoAlpha: 0, y: 18 })
      gsap.set('.il-w > span', { yPercent: 108 })
      gsap.set('.il-dot', { autoAlpha: 0, scale: 0.4 })
      gsap.set('.il-soc', { autoAlpha: 0, y: 12 })
      gsap.set('.il-soc-ic', { autoAlpha: 0, scale: 0.55 })

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

      // --- COPY BEATS: one line per scroll beat, sharing the assembly range ---
      // The beats run 0.4→1.9, 2.2→3.5 and 3.9→5.0, so each one lands in a
      // clear gap after the last — a distinct reveal per stretch of scroll.
      // 1 — the promise, rising with the cream ring
      tl.to('.il-1', { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.9 }, 0.4)
        .to('.il-1 .il-w > span', { yPercent: 0, ease: 'power3.out', duration: 1.0, stagger: 0.055 }, 0.4)
        // 2 — the kicker, with the gold diamonds popping in after the words
        .to('.il-2', { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.8 }, 2.2)
        .to('.il-2 .il-w > span', { yPercent: 0, ease: 'power3.out', duration: 0.95, stagger: 0.055 }, 2.2)
        .to('.il-dot', { autoAlpha: 1, scale: 1, ease: 'back.out(2)', duration: 0.85 }, 2.65)
        // 3 — the accounts, cascading left to right; each icon blooms the way
        //     the badge layers do. The three sub-tweens share one stagger so an
        //     account's plate, handle and row always arrive together.
        .to('.il-3', { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 3.9)
        .to('.il-soc', { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.7, stagger: 0.24 }, 3.9)
        .to('.il-soc-ic', { autoAlpha: 1, scale: 1, ease: 'back.out(1.7)', duration: 0.8, stagger: 0.24 }, 3.9)
        .to('.il-3 .il-w > span', { yPercent: 0, ease: 'power3.out', duration: 0.85, stagger: 0.24 }, 4.0)
        // --- and away: they lift and dissolve just before the badge leaves for
        //     the header. Bottom line first, and the lift is big enough that
        //     every line is gone before the rising hero card reaches its slot. ---
        .to(['.il-1', '.il-2', '.il-3'], {
          autoAlpha: 0,
          y: -48,
          ease: 'power2.in',
          duration: 0.6,
          stagger: { each: 0.11, from: 'end' },
        }, 5.95)

      // ---- 3D depth: mouse tilt + per-layer parallax (on the inner wrapper so
      //      it never fights the corner-travel transform on .brand-badge) ----
      const rotY = gsap.quickTo(inner, 'rotationY', { duration: 0.7, ease: 'power2.out' })
      const rotX = gsap.quickTo(inner, 'rotationX', { duration: 0.7, ease: 'power2.out' })
      const par = [[girl, 22], [cream, 14], [green, 8]].map(([el, depth]) => ({
        x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power2.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power2.out' }),
        depth,
      }))
      const onMove = (e: any) => {
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
      {/* copy beats — revealed one per scroll beat while the badge assembles */}
      <div className="intro-lines">
        <p className="il il-1">{words(PROMISE)}</p>
        <p className="il il-2">
          <i className="il-dot" aria-hidden="true">•</i>
          {words(KICKER)}
          <i className="il-dot" aria-hidden="true">•</i>
        </p>
        <div className="il il-3">
          {accounts.map(({ platform, name, label, url }) => {
            const inner = (
              <>
                <svg className="il-soc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  {SOCIAL_ICONS[platform]}
                </svg>
                <span className="il-w"><span>{label}</span></span>
              </>
            )
            // No URL yet — show the account, but never as a link to nowhere.
            return url ? (
              <a
                className="il-soc"
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${label} on ${name}`}
              >
                {inner}
              </a>
            ) : (
              <span className="il-soc il-soc-flat" key={platform} aria-label={`${label} on ${name}`} role="img">
                {inner}
              </span>
            )
          })}
        </div>
      </div>
      <div className="intro-cue">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
