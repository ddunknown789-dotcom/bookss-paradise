'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import MediaBrowser, { type Folder, type MediaItem } from './MediaBrowser'
import { ClearFieldButton, ConfirmButton, Ic, Modal, OptionalNote, Submit, useCanDrag, useToast } from './ui'

/* ============================================================================
   A whole small table edited on one screen: add rows, reorder by drag, delete,
   save once. Used for categories, services, video cards, menu items and social
   links — anything where the collection IS the page.
   ========================================================================== */

export type ColumnSpec = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'slug' | 'select' | 'toggle' | 'number' | 'url' | 'date' | 'media'
  /** For `slug`: which column to derive from until edited by hand. */
  from?: string
  options?: { value: string; label: string }[]
  /** For `media`: which kind of file the library offers. */
  accept?: 'image' | 'video' | 'pdf' | 'all'
  width?: string
  required?: boolean
  placeholder?: string
}

/** Passed once by the page when any column is a `media` column. */
export type MediaLibrary = { items: MediaItem[]; folders: Folder[]; supabaseUrl: string }

export type Row = Record<string, unknown> & { id?: string }

const auto = (v: string) =>
  v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function CollectionEditor({
  rows: initial,
  columns,
  onSave,
  blank,
  addLabel = 'Add row',
  emptyText = 'Nothing here yet.',
  note,
  optionalNote,
  title,
  media,
}: {
  rows: Row[]
  columns: ColumnSpec[]
  onSave: (rows: Row[]) => Promise<{ ok: boolean; error?: string; message?: string }>
  blank: Row
  addLabel?: string
  emptyText?: string
  note?: React.ReactNode
  /** Overrides the standard "blank cells are hidden" wording for this table. */
  optionalNote?: React.ReactNode
  /**
   * What this table holds, named in the save bar. Worth passing on any page
   * that stacks several of these: the bar is what you can see once you have
   * scrolled down into the rows, so it is where the answer to "which one am I
   * editing?" belongs.
   */
  title?: React.ReactNode
  /** Required when any column has type `media`. */
  media?: MediaLibrary
}) {
  const router = useRouter()
  const toast = useToast()
  const [rows, setRows] = useState<Row[]>(initial)
  const [dragging, setDragging] = useState<number | null>(null)
  // Which cell has the library open, as "<row index>:<column key>".
  const [picking, setPicking] = useState<string | null>(null)

  const set = (i: number, patch: Row) => setRows((r) => r.map((x, n) => (n === i ? { ...x, ...patch } : x)))
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return
    setRows((r) => {
      const next = [...r]
      const [x] = next.splice(from, 1)
      next.splice(to, 0, x)
      return next
    })
  }

  const canDrag = useCanDrag()

  /**
   * Which way there is more table to reach, as a space-separated list.
   *
   * A nine-column editor scrolls sideways inside its panel, and on a Mac the
   * overlay scrollbar stays hidden until something is already scrolling — so
   * the last columns simply looked as though they did not exist. This drives a
   * fade at whichever edge still has table behind it, and goes quiet the
   * moment everything fits.
   */
  const scroller = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState('')

  useEffect(() => {
    const el = scroller.current
    if (!el) return

    const sync = () => {
      const max = el.scrollWidth - el.clientWidth
      // A hair of slack: sub-pixel widths mean the ends rarely land exactly.
      if (max <= 1) return setMore('')
      setMore(
        [el.scrollLeft > 1 && 'left', el.scrollLeft < max - 1 && 'right']
          .filter(Boolean)
          .join(' '),
      )
    }

    sync()
    el.addEventListener('scroll', sync, { passive: true })
    // Catches the window resizing, the sidebar opening, a textarea being
    // dragged taller — anything that changes what fits.
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      observer.disconnect()
    }
  }, [rows.length, columns.length])

  /* A bare `1fr` track is `minmax(auto, 1fr)`, and that `auto` floor is the
     cell's min-content width. One long filename in a media cell — an uploaded
     video is usually named after its upload id — and the floor grows wider
     than the panel, so the row used to push the whole page sideways and the
     phone got a second surface to pan. A flexible track is capped instead: it
     may shrink to `--ad-ce-min`, and when even that doesn't fit, `.ad-ce-scroll`
     scrolls the editor rather than the page. On a phone the row is a stack and
     the stylesheet overrides all of this to one full-width column. */
  const track = (w: string) => (w.trim().endsWith('fr') ? `minmax(var(--ad-ce-min), ${w.trim()})` : w)
  const grid = `28px ${columns.map((c) => track(c.width ?? '1fr')).join(' ')} 74px`

  return (
    <>
    <form
      action={async () => {
        const res = await onSave(rows)
        if (res.ok) {
          toast(res.message ?? 'Saved')
          router.refresh()
        } else toast(res.error ?? 'Could not save', 'error')
      }}
    >
      {note && <p className="ad-hint" style={{ marginBottom: 12 }}>{note}</p>}

      <OptionalNote>
        {optionalNote ?? (
          <>
            Only the columns marked with a <b>*</b> are needed. <b>Leave any other cell empty and it is
            left off the live page</b> for that row alone — the rest of the row carries on as normal.
          </>
        )}
      </OptionalNote>

      <div className="ad-ce-scroller" data-more={more || undefined}>
      <div className="ad-ce-scroll" ref={scroller}>
        {rows.length > 0 && (
          <div
            className="ad-ce-head"
            style={{
              display: 'grid', gridTemplateColumns: grid, gap: 8, padding: '0 0 6px',
              fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
              color: 'var(--ad-faint)',
            }}
          >
            <span />
            {columns.map((c) => (
              <span key={c.key}>
                {c.label}
                {c.required && <b title="Needed — the row cannot be saved without it"> *</b>}
              </span>
            ))}
            <span />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => (
            <div
              key={(row.id as string) ?? `new-${i}`}
              className="ad-ce-row"
              draggable={canDrag}
              onDragStart={() => setDragging(i)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging !== null && dragging !== i) move(dragging, i)
                setDragging(null)
              }}
              style={{
                display: 'grid', gridTemplateColumns: grid, gap: 8, alignItems: 'center',
                padding: '7px 8px', borderRadius: 8,
                border: '1px solid var(--ad-line-soft)',
                background: dragging === i ? 'var(--ad-gold-soft)' : '#fbfaf7',
              }}
            >
              <span className="ad-drag" title="Drag to reorder" aria-hidden="true">
                <Ic n="grip" style={{ width: 15, height: 15, stroke: 'currentColor', fill: 'none', strokeWidth: 1.6 }} />
              </span>

              {columns.map((col) => {
                const value = row[col.key]
                if (col.type === 'toggle') {
                  return (
                    <label key={col.key} className="ad-ce-cell ad-check" data-label={col.label} style={{ justifyContent: 'center' }}>
                      <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(i, { [col.key]: e.target.checked })} />
                    </label>
                  )
                }
                if (col.type === 'select') {
                  return (
                    <span key={col.key} className="ad-ce-cell" data-label={col.label}>
                      <select className="ad-select" value={String(value ?? '')} onChange={(e) => set(i, { [col.key]: e.target.value })}>
                        {(col.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </span>
                  )
                }
                if (col.type === 'media') {
                  // The cell stores the media id; the filename beside it comes
                  // from the library that is already loaded on the page, so
                  // nothing extra has to be selected or carried on the row.
                  const picked = media?.items.find((m) => m.id === value) ?? null
                  return (
                    <span key={col.key} className="ad-ce-cell" data-label={col.label}>
                      <span className="ad-ce-media">
                        <button
                          type="button"
                          className="ad-btn ad-btn-sm"
                          onClick={() => setPicking(`${i}:${col.key}`)}
                          title={picked?.filename}
                        >
                          {picked ? picked.filename : 'Choose file'}
                        </button>
                        {picked && (
                          <button
                            type="button"
                            className="ad-btn ad-btn-ghost ad-btn-icon"
                            onClick={() => set(i, { [col.key]: '' })}
                            aria-label={`Remove ${col.label.toLowerCase()}`}
                          >
                            <Ic n="x" />
                          </button>
                        )}
                      </span>
                    </span>
                  )
                }
                if (col.type === 'date') {
                  // A date cannot be emptied by typing over it the way the
                  // other cells can, so it carries its own way out.
                  return (
                    <span key={col.key} className="ad-ce-cell" data-label={col.label}>
                      <span className="ad-clearable">
                        <input
                          className="ad-input"
                          type="date"
                          required={col.required}
                          value={String(value ?? '')}
                          onChange={(e) => set(i, { [col.key]: e.target.value })}
                        />
                        <ClearFieldButton
                          label={col.label}
                          filled={Boolean(value)}
                          onClear={() => set(i, { [col.key]: '' })}
                        />
                      </span>
                    </span>
                  )
                }
                if (col.type === 'textarea') {
                  return (
                    <span key={col.key} className="ad-ce-cell" data-label={col.label}>
                      <textarea
                        className="ad-textarea"
                        style={{ minHeight: 40 }}
                        value={String(value ?? '')}
                        placeholder={col.placeholder}
                        onChange={(e) => set(i, { [col.key]: e.target.value })}
                      />
                    </span>
                  )
                }
                return (
                  <span key={col.key} className="ad-ce-cell" data-label={col.label}>
                  <input
                    className="ad-input"
                    type={col.type === 'number' ? 'number' : 'text'}
                    required={col.required}
                    placeholder={col.placeholder}
                    value={String(value ?? '')}
                    onChange={(e) => {
                      const patch: Row = { [col.key]: col.type === 'slug' ? auto(e.target.value) : e.target.value }
                      // typing a name fills an empty slug beside it
                      if (col.from) {
                        const slugCol = columns.find((c) => c.type === 'slug' && c.from === col.key)
                        if (slugCol && !row[slugCol.key]) patch[slugCol.key] = auto(e.target.value)
                      }
                      const derived = columns.find((c) => c.type === 'slug' && c.from === col.key)
                      if (derived && !row[derived.key]) patch[derived.key] = auto(e.target.value)
                      set(i, patch)
                    }}
                  />
                  </span>
                )
              })}

              <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-icon" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Up">
                  <Ic n="up" />
                </button>
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-icon" onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} aria-label="Down">
                  <Ic n="down" />
                </button>
                <ConfirmButton
                  className="ad-btn ad-btn-ghost ad-btn-icon"
                  title="Remove this row?"
                  body="It is removed from the site when you save."
                  confirmLabel="Remove"
                  onConfirm={() => setRows((r) => r.filter((_, n) => n !== i))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {!rows.length && <p className="ad-muted" style={{ padding: '18px 0', fontSize: 13 }}>{emptyText}</p>}

      <button type="button" className="ad-btn ad-btn-sm" style={{ marginTop: 10 }} onClick={() => setRows((r) => [...r, { ...blank }])}>
        <Ic n="plus" />
        {addLabel}
      </button>

      <div className="ad-sticky-save">
        <span className="ad-muted" style={{ fontSize: 12.6 }}>
          {title && <span className="ad-save-scope"><b>{title}</b> — </span>}
          {canDrag ? 'Reorder by dragging.' : 'Reorder with the arrows.'} Changes go live when you save.
        </span>
        <span className="ad-right"><Submit /></span>
      </div>

    </form>

    {/* Outside the form on purpose: the library has its own form for editing a
        file's details, and one form nested inside another is not something a
        browser is obliged to make sense of. */}
    {media && (
      <Modal open={!!picking} onClose={() => setPicking(null)} title="Choose a file" wide>
        <MediaBrowser
          items={media.items}
          folders={media.folders}
          supabaseUrl={media.supabaseUrl}
          accept={columns.find((c) => c.key === picking?.split(':')[1])?.accept ?? 'all'}
          pick={(item) => {
            const [index, key] = (picking ?? '').split(':')
            if (key) set(Number(index), { [key]: item.id })
            setPicking(null)
          }}
        />
      </Modal>
    )}
    </>
  )
}
