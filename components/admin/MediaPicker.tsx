'use client'

import { useState, useTransition } from 'react'

import MediaBrowser, { publicUrl, type Folder, type MediaItem } from './MediaBrowser'
import { Ic, Modal, useToast } from './ui'

/**
 * A single-image (or video/PDF) field.
 *
 * Renders the current selection with Change/Remove, and opens the full media
 * library — search, folders, drag & drop upload and all — to pick a new one.
 * Posts the chosen id in a hidden input so it submits with the parent form.
 */
export default function MediaPicker({
  name,
  label,
  value,
  items,
  folders,
  supabaseUrl,
  accept = 'image',
  hint,
  optional,
  onLibraryRefresh,
}: {
  name: string
  label: string
  value?: MediaItem | null
  items: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
  accept?: 'image' | 'video' | 'pdf' | 'all'
  hint?: React.ReactNode
  optional?: boolean
  onLibraryRefresh?: () => void
}) {
  const [picked, setPicked] = useState<MediaItem | null>(value ?? null)
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const toast = useToast()

  return (
    <div className="ad-field">
      <label className="ad-label">
        {label}
        {optional && <span className="ad-opt">optional</span>}
      </label>

      <input type="hidden" name={name} value={picked?.id ?? ''} readOnly />

      <div className="ad-pick">
        <span className="ad-pick-thumb">
          {picked ? (
            picked.kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={publicUrl(picked.path, supabaseUrl)} alt="" />
            ) : (
              <span className="ad-media-kind">{picked.kind.toUpperCase()}</span>
            )
          ) : (
            <Ic n="image" style={{ width: 20, height: 20, stroke: 'var(--ad-faint)', fill: 'none', strokeWidth: 1.6 }} />
          )}
        </span>

        <span className="ad-pick-body">
          {picked ? (
            <>
              <b>{picked.filename}</b>
              <span>
                {picked.width && picked.height ? `${picked.width}×${picked.height}` : picked.kind}
                {picked.alt_text ? ` · alt set` : ' · no alt text'}
              </span>
            </>
          ) : (
            <span className="ad-muted">Nothing selected</span>
          )}
        </span>

        <span className="ad-pick-actions">
          <button type="button" className="ad-btn ad-btn-sm" onClick={() => setOpen(true)}>
            {picked ? 'Change' : 'Choose'}
          </button>
          {picked && (
            <button
              type="button"
              className="ad-btn ad-btn-sm ad-btn-ghost"
              onClick={() => setPicked(null)}
              aria-label="Remove"
            >
              <Ic n="x" />
            </button>
          )}
        </span>
      </div>

      {hint && <p className="ad-hint">{hint}</p>}

      <Modal open={open} onClose={() => setOpen(false)} title={`Choose ${label.toLowerCase()}`} wide>
        <MediaBrowser
          items={items}
          folders={folders}
          supabaseUrl={supabaseUrl}
          accept={accept}
          onRefresh={() => startTransition(() => onLibraryRefresh?.())}
          pick={(item) => {
            setPicked(item)
            setOpen(false)
            if (!item.alt_text && item.kind === 'image') {
              toast('Tip: add alt text to this image in the Media Library for better SEO')
            }
          }}
        />
      </Modal>
    </div>
  )
}
