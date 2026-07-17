import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from './ui'

const LINKS = [
  { label: 'Home', href: '#home', active: true },
  { label: 'Books', href: '#books' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Trailers', href: '#trailers' },
  { label: 'Community', href: '#community' },
  { label: 'About', href: '#about' },
]

export default function Nav() {
  const root = useRef(null)
  const [solid, setSolid] = useState(false)
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useLayoutEffect(() => {
    if (NOANIM) {
      setVisible(true)
      return
    }
    // NOTE: resolve the hero from document — gsap.context would scope a
    // '.hero' selector string to the nav's own subtree and silently fall
    // back to the viewport (firing at load).
    const heroEl = document.querySelector('.hero')
    const ctx = gsap.context(() => {
      // class-driven visibility: deterministic under any refresh/misfire
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'top 78%',
        onEnter: () => setVisible(true),
        onLeaveBack: () => setVisible(false),
      })
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'bottom 90px',
        onToggle: (self) => setSolid(self.isActive),
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={`nav ${visible ? 'nav-visible' : ''} ${solid ? 'nav-solid' : ''} ${menuOpen ? 'nav-open' : ''}`}
      ref={root}
    >
      <div className="nav-inner">
        {/* the header logo is the fixed badge that flies in from the intro;
            this spacer just reserves its slot in the nav layout */}
        <a className="nav-logo-slot" href="#home" aria-label="Books Paradise home" onClick={() => setMenuOpen(false)} />
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className={l.active ? 'active' : ''}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <span className="nav-arrow" aria-hidden="true">
            <ArrowRight size={20} color="#C9962F" />
          </span>
          <a className="btn btn-gold btn-join" href="#newsletter">Join Us</a>
        </div>
        <button
          className="nav-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="nav-drawer" role="dialog" aria-modal="true" aria-hidden={!menuOpen}>
        <nav className="nav-drawer-links" aria-label="Mobile">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className={l.active ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-gold btn-join-drawer" href="#newsletter" onClick={() => setMenuOpen(false)}>
          Join Us
        </a>
      </div>
    </header>
  )
}
