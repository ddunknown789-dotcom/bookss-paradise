'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { NOANIM } from '@/lib/anim'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis + ScrollTrigger wiring, lifted verbatim out of the old App.jsx so the
 * scroll feel is byte-for-byte what it was. Mounted once in the root layout.
 *
 * `window.__lenis` stays on the window: internal navigation restores scroll
 * through it, and Lenis otherwise snaps the jump straight back.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (NOANIM) {
      document.body.classList.add('noanim')
      return
    }

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // re-measure once every asset (fonts, images) has arrived
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    ;(window as unknown as { __lenis: Lenis | null }).__lenis = lenis

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      lenis.destroy()
      ;(window as unknown as { __lenis: Lenis | null }).__lenis = null
    }
  }, [])

  return null
}
