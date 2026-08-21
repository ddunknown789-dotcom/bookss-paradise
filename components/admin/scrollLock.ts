/* ============================================================================
   One page-scroll lock for the whole admin.

   Every overlay that covers the screen — modals, the mobile nav drawer — has
   to stop the page behind it from scrolling. Doing that per-overlay by saving
   and restoring `document.body.style.overflow` is what used to lock the panel
   solid: two overlays open at once (the media library opens from inside a
   dialog, and a delete confirmation opens from inside the library) each saved
   the *other's* value, so whichever unmounted last put `overflow: hidden`
   back on the body and left it there. The only way out was a reload.

   So the lock is counted, in one place. The first locker applies it, the last
   one to release takes it off, and a release function that runs twice — which
   React does in development, and again on every fast-refresh — is ignored the
   second time.
   ========================================================================== */

type Restore = () => void

let depth = 0
let restore: Restore | null = null

/** `matchMedia` is missing in jsdom and in the server pass; assume a mouse. */
const isTouch = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches

function apply(): Restore {
  const doc = document.documentElement
  const body = document.body

  const scrollY = window.scrollY
  // Taking the scrollbar away widens the page; pad by exactly its width so
  // nothing behind the overlay jumps sideways as it opens.
  const gutter = window.innerWidth - doc.clientWidth

  const before = {
    htmlOverflow: doc.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyPadRight: body.style.paddingRight,
  }

  doc.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
  if (gutter > 0) body.style.paddingRight = `${gutter}px`

  // `overflow: hidden` alone is enough for a mouse, and it is the cheap option:
  // nothing reflows. Touch browsers still rubber-band the document behind the
  // overlay, so there the body is pinned outright and the scroll offset is
  // carried on `top` — the reflow that costs is hidden under a dialog that
  // covers the whole screen anyway.
  const pinned = isTouch()
  if (pinned) {
    body.style.position = 'fixed'
    body.style.top = `${-scrollY}px`
    body.style.width = '100%'
  }

  return () => {
    doc.style.overflow = before.htmlOverflow
    body.style.overflow = before.bodyOverflow
    body.style.paddingRight = before.bodyPadRight
    if (pinned) {
      body.style.position = before.bodyPosition
      body.style.top = before.bodyTop
      body.style.width = before.bodyWidth
      // Un-pinning drops the page back to the top, so put it back where it was
      // — without animating, whatever `scroll-behavior` the page asks for.
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }
}

/**
 * Freeze page scrolling until the returned function is called. Safe to nest,
 * and safe to release more than once.
 */
export function lockPageScroll(): Restore {
  if (typeof document === 'undefined') return () => {}

  depth += 1
  if (depth === 1) restore = apply()

  let released = false
  return () => {
    if (released) return
    released = true
    depth -= 1
    if (depth === 0) {
      restore?.()
      restore = null
    }
  }
}
