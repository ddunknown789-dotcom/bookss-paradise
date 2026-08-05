'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from './ui'

/* A static twin of Nav.jsx for standalone pages (interviews, etc.) that have
   no `.hero` to scroll-trigger against. Nav.jsx's visibility and its parked
   logo badge are both driven by the homepage's Intro/scroll timeline, which
   doesn't exist here — so this renders permanently visible/solid with a
   plain circular logo image instead of waiting for the flying badge.
   Same markup/classes as Nav.jsx (nav, nav-inner, nav-links...) so it's
   pixel-identical without touching the shared component or its CSS. */

const LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'Books', href: '/books' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'Trailers', href: '/#trailers' },
  { label: 'Community', href: '/#community' },
  { label: 'About', href: '/#about' },
]

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className={`nav nav-visible nav-solid${menuOpen ? ' nav-open' : ''}`}>
      <div className="nav-inner">
        <a className="nav-logo-slot site-header-logo" href="/" aria-label="Books Paradise home" onClick={() => setMenuOpen(false)}>
          <img src="/assets/logo.png" alt="" />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-right">
          <span className="nav-arrow" aria-hidden="true">
            <ArrowRight size={20} color="#C9962F" />
          </span>
          <a className="btn btn-gold btn-join" href="/#newsletter">Join Us</a>
        </div>
        <button
          className="nav-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className="nav-drawer" role="dialog" aria-modal="true" aria-hidden={!menuOpen}>
        <nav className="nav-drawer-links" aria-label="Mobile">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <a className="btn btn-gold btn-join-drawer" href="/#newsletter" onClick={() => setMenuOpen(false)}>
          Join Us
        </a>
      </div>
    </header>
  )
}
