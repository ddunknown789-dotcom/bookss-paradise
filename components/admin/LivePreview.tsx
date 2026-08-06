'use client'

import { useEffect, useRef, useState } from 'react'

import { Ic } from './ui'

const SIZES = {
  desktop: { w: '100%', label: 'Desktop' },
  tablet: { w: '768px', label: 'Tablet' },
  mobile: { w: '375px', label: 'Mobile' },
} as const

type Size = keyof typeof SIZES

/**
 * Live preview of a public page, inside the admin.
 *
 * It loads the real site in an iframe rather than re-implementing the design,
 * so what you see is genuinely what visitors get — same CSS, same animations.
 * `?noanim` is appended so entrance animations don't replay on every reload
 * and hide the section you're editing behind a fade.
 *
 * Call `refresh()` after a save; `reloadKey` bumping also forces it.
 */
export default function LivePreview({
  path = '/',
  reloadKey = 0,
  height = 620,
}: {
  path?: string
  reloadKey?: number
  height?: number
}) {
  const [size, setSize] = useState<Size>('desktop')
  const [open, setOpen] = useState(false)
  const [nonce, setNonce] = useState(0)
  const frame = useRef<HTMLIFrameElement>(null)

  // Re-fetch whenever the caller says something was saved.
  useEffect(() => {
    if (reloadKey) setNonce((n) => n + 1)
  }, [reloadKey])

  const src = `${path}${path.includes('?') ? '&' : '?'}noanim=1&_=${nonce}`

  return (
    <section className="ad-panel">
      <div className="ad-panel-head">
        <h2>Live preview</h2>
        <p className="ad-muted">The real page, exactly as visitors see it.</p>
        <span className="ad-right">
          {open && (
            <>
              {(Object.keys(SIZES) as Size[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`ad-btn ad-btn-sm ${size === k ? 'ad-btn-primary' : ''}`}
                  onClick={() => setSize(k)}
                >
                  {SIZES[k].label}
                </button>
              ))}
              <button type="button" className="ad-btn ad-btn-sm" onClick={() => setNonce((n) => n + 1)} title="Reload">
                <Ic n="reset" />
              </button>
            </>
          )}
          <button type="button" className="ad-btn ad-btn-sm" onClick={() => setOpen((v) => !v)}>
            <Ic n={open ? 'eyeOff' : 'eye'} />
            {open ? 'Hide' : 'Show'}
          </button>
          <a className="ad-btn ad-btn-sm" href={path} target="_blank" rel="noreferrer" title="Open in a new tab">
            <Ic n="external" />
          </a>
        </span>
      </div>

      {open && (
        <div className="ad-panel-body" style={{ background: '#e9e6dd', display: 'grid', placeItems: 'start center' }}>
          <iframe
            ref={frame}
            key={nonce}
            src={src}
            title="Live preview of the site"
            style={{
              width: SIZES[size].w,
              maxWidth: '100%',
              height,
              border: '1px solid var(--ad-line)',
              borderRadius: 8,
              background: '#fff',
              transition: 'width .25s cubic-bezier(.22,1,.36,1)',
            }}
          />
        </div>
      )}
    </section>
  )
}
