'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Ic, Modal, Submit, useCanDrag, useToast } from './ui'
import SectionFields from './SectionFields'
import LivePreview from './LivePreview'
import { saveSectionContent, saveSectionLayout } from '@/app/admin/(panel)/homepage/actions'
import type { SectionType } from '@/lib/supabase/database.types'

export type SectionRow = {
  id: string
  type: SectionType
  name: string
  visible: boolean
  content: Record<string, unknown>
}

/** What each section pulls in automatically, so editors know what they control. */
const AUTO: Partial<Record<SectionType, string>> = {
  top_picks: 'Books come from the Books screen',
  reviews: 'Uses each book’s review excerpt',
  book_of_week: 'Picks come from Book of the Week',
  interviews: 'Uses the latest published interviews',
  videos: 'Cards come from the Videos screen',
  offer: 'Cards come from the Services screen',
  intro: 'The animated brand badge',
}

export default function SectionBuilder({ sections: initial }: { sections: SectionRow[] }) {
  const router = useRouter()
  const toast = useToast()

  const [rows, setRows] = useState(initial)
  const [dragging, setDragging] = useState<number | null>(null)
  // HTML5 drag-and-drop has no touch equivalent; on a phone the arrows reorder.
  const canDrag = useCanDrag()
  const [editing, setEditing] = useState<SectionRow | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  // bumped after every successful save so the preview reloads with the change
  const [previewKey, setPreviewKey] = useState(0)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return
    setRows((r) => {
      const next = [...r]
      const [x] = next.splice(from, 1)
      next.splice(to, 0, x)
      return next
    })
    setDirty(true)
  }

  const toggle = (i: number) => {
    setRows((r) => r.map((x, n) => (n === i ? { ...x, visible: !x.visible } : x)))
    setDirty(true)
  }

  const saveLayout = async () => {
    setSaving(true)
    try {
      const res = await saveSectionLayout(rows.map(({ id, visible }) => ({ id, visible })))
      if (res.ok) {
        toast('Layout saved — the home page is updated')
        setDirty(false)
        setPreviewKey((k) => k + 1)
        router.refresh()
      } else toast(res.error ?? 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="ad-panel">
        <div className="ad-panel-head">
          <h2>Sections</h2>
          <p className="ad-muted">Top to bottom, exactly as visitors see them.</p>
        </div>

        <div className="ad-panel-body">
          <div className="ad-sec-list">
            {rows.map((s, i) => (
              <div
                key={s.id}
                className={`ad-sec ${s.visible ? '' : 'is-hidden'} ${dragging === i ? 'is-dragging' : ''}`}
                draggable={canDrag}
                onDragStart={() => setDragging(i)}
                onDragEnd={() => setDragging(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragging !== null && dragging !== i) move(dragging, i)
                  setDragging(null)
                }}
              >
                <span className="ad-drag" title="Drag to reorder" aria-hidden="true">
                  <Ic n="grip" style={{ width: 16, height: 16, stroke: 'currentColor', fill: 'none', strokeWidth: 1.6 }} />
                </span>

                <span className="ad-faint ad-mono" style={{ width: 20 }}>{i + 1}</span>

                <span className="ad-sec-name">
                  <b>{s.name}</b>
                  <span>{AUTO[s.type] ?? 'Text, images and buttons you control'}</span>
                </span>

                <span className="ad-sec-actions">
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-icon"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <Ic n="up" />
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-icon"
                    onClick={() => move(i, i + 1)}
                    disabled={i === rows.length - 1}
                    aria-label="Move down"
                  >
                    <Ic n="down" />
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-icon"
                    onClick={() => toggle(i)}
                    title={s.visible ? 'Hide this section' : 'Show this section'}
                  >
                    <Ic n={s.visible ? 'eye' : 'eyeOff'} />
                  </button>
                  <button type="button" className="ad-btn ad-btn-sm" onClick={() => setEditing(s)}>
                    Edit
                  </button>
                </span>
              </div>
            ))}
          </div>

          {!rows.length && (
            <p className="ad-muted" style={{ padding: 18 }}>
              No sections found. Run the migrations, then reload.
            </p>
          )}
        </div>
      </section>

      <LivePreview path="/" reloadKey={previewKey} />

      <div className="ad-sticky-save">
        <span className="ad-muted" style={{ fontSize: 12.6 }}>
          {dirty ? 'You have unsaved order or visibility changes.' : 'Order and visibility are up to date.'}
        </span>
        <span className="ad-right">
          <button type="button" className="ad-btn ad-btn-primary" onClick={saveLayout} disabled={!dirty || saving}>
            {saving && <Ic n="spinner" className="ad-spin" />}
            {saving ? 'Saving…' : 'Save layout'}
          </button>
        </span>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit — ${editing.name}` : ''} wide>
        {editing && (
          <form
            action={async (fd) => {
              const content: Record<string, unknown> = {}
              for (const [k, v] of fd.entries()) {
                if (k.startsWith('__')) continue
                content[k] = v
              }
              const parsed = SectionFields.parse(editing.type, fd, editing.content)
              const res = await saveSectionContent(editing.id, editing.type, parsed)
              if (res.ok) {
                toast('Section saved — the home page is updated')
                setEditing(null)
                setPreviewKey((k) => k + 1)
                router.refresh()
              } else toast(res.error ?? 'Could not save', 'error')
            }}
          >
            <SectionFields type={editing.type} content={editing.content} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="ad-btn" onClick={() => setEditing(null)}>Cancel</button>
              <Submit>Save section</Submit>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
