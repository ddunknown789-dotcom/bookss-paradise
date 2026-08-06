'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmButton, Ic, Submit, useToast } from './ui'

/* ============================================================================
   A whole small table edited on one screen: add rows, reorder by drag, delete,
   save once. Used for categories, services, video cards, menu items and social
   links — anything where the collection IS the page.
   ========================================================================== */

export type ColumnSpec = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'slug' | 'select' | 'toggle' | 'number' | 'url'
  /** For `slug`: which column to derive from until edited by hand. */
  from?: string
  options?: { value: string; label: string }[]
  width?: string
  required?: boolean
  placeholder?: string
}

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
}: {
  rows: Row[]
  columns: ColumnSpec[]
  onSave: (rows: Row[]) => Promise<{ ok: boolean; error?: string; message?: string }>
  blank: Row
  addLabel?: string
  emptyText?: string
  note?: React.ReactNode
}) {
  const router = useRouter()
  const toast = useToast()
  const [rows, setRows] = useState<Row[]>(initial)
  const [dragging, setDragging] = useState<number | null>(null)

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

  const grid = `28px ${columns.map((c) => c.width ?? '1fr').join(' ')} 74px`

  return (
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

      {rows.length > 0 && (
        <div
          style={{
            display: 'grid', gridTemplateColumns: grid, gap: 8, padding: '0 0 6px',
            fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
            color: 'var(--ad-faint)',
          }}
        >
          <span />
          {columns.map((c) => <span key={c.key}>{c.label}</span>)}
          <span />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((row, i) => (
          <div
            key={(row.id as string) ?? `new-${i}`}
            draggable
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
            <span className="ad-drag" title="Drag to reorder">
              <Ic n="grip" style={{ width: 15, height: 15, stroke: 'currentColor', fill: 'none', strokeWidth: 1.6 }} />
            </span>

            {columns.map((col) => {
              const value = row[col.key]
              if (col.type === 'toggle') {
                return (
                  <label key={col.key} className="ad-check" style={{ justifyContent: 'center' }}>
                    <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(i, { [col.key]: e.target.checked })} />
                  </label>
                )
              }
              if (col.type === 'select') {
                return (
                  <select key={col.key} className="ad-select" value={String(value ?? '')} onChange={(e) => set(i, { [col.key]: e.target.value })}>
                    {(col.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )
              }
              if (col.type === 'textarea') {
                return (
                  <textarea
                    key={col.key}
                    className="ad-textarea"
                    style={{ minHeight: 40 }}
                    value={String(value ?? '')}
                    placeholder={col.placeholder}
                    onChange={(e) => set(i, { [col.key]: e.target.value })}
                  />
                )
              }
              return (
                <input
                  key={col.key}
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

      {!rows.length && <p className="ad-muted" style={{ padding: '18px 0', fontSize: 13 }}>{emptyText}</p>}

      <button type="button" className="ad-btn ad-btn-sm" style={{ marginTop: 10 }} onClick={() => setRows((r) => [...r, { ...blank }])}>
        <Ic n="plus" />
        {addLabel}
      </button>

      <div className="ad-sticky-save">
        <span className="ad-muted" style={{ fontSize: 12.6 }}>Reorder by dragging. Changes go live when you save.</span>
        <span className="ad-right"><Submit /></span>
      </div>
    </form>
  )
}
