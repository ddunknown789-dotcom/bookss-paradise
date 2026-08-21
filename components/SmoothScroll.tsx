'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { NOANIM } from '@/lib/anim'

gsap.registerPlugin(ScrollTrigger)

// iOS Safari grows/shrinks the visual viewport by ~60–90px as the URL bar
// collapses and re-expands during a scroll. That fires `resize`, which would
// otherwise make ScrollTrigger re-measure the whole page mid-gesture and snap
// every scrubbed timeline (the fixed intro badge worst of all) to a new
// position. Ignoring those particular resizes is what keeps the scroll steady
// on a phone; a real rotation still refreshes, because the orientation change
// comes through separately.
ScrollTrigger.config({ ignoreMobileResize: true })

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

    // `smoothWheel` only touches wheel input. Touch is deliberately left to the
    // platform: iOS momentum scrolling is already frame-perfect and handing it
    // to a JS rAF loop is what makes a phone feel sticky rather than smooth.
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // re-measure once every asset (fonts, images) has arrived
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)

    // Rotating the device is a genuine layout change, so re-measure there — but
    // only after the new viewport has actually settled, which iOS reports a
    // frame or two late.
    let rotateTimer = 0
    const onOrientation = () => {
      clearTimeout(rotateTimer)
      rotateTimer = window.setTimeout(() => ScrollTrigger.refresh(), 250)
    }
    window.addEventListener('orientationchange', onOrientation)
    ;(window as unknown as { __lenis: Lenis | null }).__lenis = lenis

    return () => {
      window.removeEventListener('load', refresh)
      window.removeEventListener('orientationchange', onOrientation)
      clearTimeout(rotateTimer)
      gsap.ticker.remove(raf)
      lenis.destroy()
      ;(window as unknown as { __lenis: Lenis | null }).__lenis = null
    }
  }, [])

  return null
}
