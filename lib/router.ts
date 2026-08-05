'use client'

import { useRouter } from 'next/navigation'

/**
 * Compatibility shim for the Vite build's hand-rolled router.
 *
 * The ported pages call `goBack('/fallback')` for their back links. Next's
 * App Router owns history now, so this just delegates — and still falls back
 * to a real navigation when there's nowhere in this tab to go back to (a
 * shared link opened directly, or a refresh on a sub-page).
 */
export function goBack(fallback = '/') {
  if (typeof window === 'undefined') return
  if (window.history.length > 1) window.history.back()
  else window.location.href = fallback
}

export { useRouter }
