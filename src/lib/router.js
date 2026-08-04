/* ============================================================================
   Minimal client-side router.

   The site has no full page-to-page reload after the very first load: every
   internal link click is intercepted and turned into a history.pushState,
   so the loader (which only lives inside the homepage branch of App.jsx)
   never gets a chance to remount and replay. A per-path scroll memory makes
   "going back" restore the exact spot the user left, the way a real browser
   back button does; a fresh forward navigation still starts at the top.
   ========================================================================== */

import { useEffect, useState } from 'react'

const normalize = (p) => p.replace(/\/+$/, '') || '/'

let currentPath = typeof window !== 'undefined' ? normalize(window.location.pathname) : '/'
const listeners = new Set()
// path -> last scrollY seen there, so a POP (back/forward) can restore it.
const scrollMemory = new Map()

function setPath(next) {
  currentPath = next
  listeners.forEach((fn) => fn(currentPath))
}

// Lenis owns the real scroll position once it's running (it fights plain
// window.scrollTo), so route through it when available.
function scrollToY(y) {
  const lenis = typeof window !== 'undefined' ? window.__lenis : null
  if (lenis && typeof lenis.scrollTo === 'function') {
    // Lenis measures content height on a 250ms debounce, so after a route
    // swap its cached limit is still the *previous* page's — force a
    // synchronous re-measure or the jump gets clamped short.
    lenis.resize?.()
    lenis.scrollTo(y, { immediate: true })
  } else {
    window.scrollTo(0, y)
  }
}

// Wait a paint so the destination branch has actually mounted before we
// measure/scroll it.
function afterPaint(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn))
}

function jumpToHashOrTop(hash) {
  afterPaint(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) { scrollToY(el.getBoundingClientRect().top + window.scrollY); return }
    }
    scrollToY(0)
  })
}

// PUSH: a link to a *new* page. Starts at the top (or a hash target),
// matching the existing "book pages always open at their title" behaviour.
export function navigate(to, { replace = false } = {}) {
  if (typeof window === 'undefined') return
  const url = new URL(to, window.location.href)
  if (url.origin !== window.location.origin) { window.location.href = to; return }

  const nextPath = normalize(url.pathname)
  const hash = url.hash

  // Same-page fragment links (in-page section nav) are left to the browser/
  // Lenis exactly as before — only an actual page change goes through here.
  if (nextPath === currentPath) return

  scrollMemory.set(currentPath, window.scrollY)

  const depth = (window.history.state?.__spaDepth ?? 0) + 1
  const state = { __spaDepth: depth }
  if (replace) window.history.replaceState(state, '', to)
  else window.history.pushState(state, '', to)

  setPath(nextPath)
  jumpToHashOrTop(hash)
}

// POP: "go back to where I was." Uses real browser history so the saved
// scroll position for the previous path is restored; falls back to a plain
// forward navigate when there's nowhere for this tab to go back to (a
// shared link opened directly, or a refresh on the sub-page).
export function goBack(fallback = '/') {
  if (typeof window === 'undefined') return
  if ((window.history.state?.__spaDepth ?? 0) > 0) window.history.back()
  else navigate(fallback)
}

export function usePath() {
  const [path, setLocal] = useState(currentPath)
  useEffect(() => {
    listeners.add(setLocal)
    return () => listeners.delete(setLocal)
  }, [])
  return path
}

if (typeof window !== 'undefined') {
  if (!window.history.state) window.history.replaceState({ __spaDepth: 0 }, '', window.location.href)
  // We restore scroll ourselves (per-path memory); don't fight the browser's
  // own guess.
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

  window.addEventListener('popstate', () => {
    const nextPath = normalize(window.location.pathname)
    setPath(nextPath)
    const saved = scrollMemory.get(nextPath) ?? 0
    afterPaint(() => scrollToY(saved))
  })

  // Delegate every internal link click through the router instead of
  // letting the browser do a full navigation/reload.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const anchor = e.target.closest('a')
    if (!anchor) return
    if (anchor.target && anchor.target !== '_self') return
    if (anchor.hasAttribute('download')) return
    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return

    let url
    try { url = new URL(href, window.location.href) } catch { return }
    if (url.origin !== window.location.origin) return

    const nextPath = normalize(url.pathname)
    // Same-page links (section anchors, bare '#' placeholders) are untouched.
    if (nextPath === currentPath) return

    e.preventDefault()
    navigate(href)
  })
}
