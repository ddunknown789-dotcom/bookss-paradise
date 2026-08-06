'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import MediaPicker from './MediaPicker'
import { ConfirmButton, Field, Ic, Modal, Repeater, Select, Submit, Text, useToast } from './ui'
import type { Folder, MediaItem } from './MediaBrowser'
import { deleteWeek, reorderWeeks, saveWeek, type WeekPick } from '@/app/admin/(panel)/weeks/actions'

type Week = {
  id: string
  key: string
  label: string
  range_label: string
  status: string
  picks: WeekPick[]
}

export default function WeeksEditor({
  weeks: initial,
  books,
  media,
  folders,
  supabaseUrl,
}: {
  weeks: Week[]
  books: { id: string; title: string }[]
  media: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [weeks, setWeeks] = useState(initial)
  const [editing, setEditing] = useState<Week | null>(null)
  const [orderDirty, setOrderDirty] = useState(false)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= weeks.length) return
    setWeeks((w) => {
      const next = [...w]
      const [x] = next.splice(from, 1)
      next.splice(to, 0, x)
      return next
    })
    setOrderDirty(true)
  }

  const blankWeek = (): Week => ({ id: '', key: '', label: '', range_label: '', status: 'published', picks: [] })

  return (
    <>
      <section className="ad-panel">
        <div className="ad-panel-head">
          <h2>Weeks</h2>
          <span className="ad-right">
            <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => setEditing(blankWeek())}>
              <Ic n="plus" />
              New week
            </button>
          </span>
        </div>

        <div className="ad-panel-body">
          <div className="ad-sec-list">
            {weeks.map((w, i) => (
              <div className={`ad-sec ${w.status === 'published' ? '' : 'is-hidden'}`} key={w.id || i}>
                <span className="ad-faint ad-mono" style={{ width: 22 }}>{i + 1}</span>
                <span className="ad-sec-name">
                  <b>
                    {w.label}
                    {i === 0 && <span className="ad-badge ad-badge-admin" style={{ marginLeft: 8 }}>on the home page</span>}
                  </b>
                  <span>{w.range_label || 'No date range'} · {w.picks.length} book{w.picks.length === 1 ? '' : 's'}</span>
                </span>
                <span className="ad-sec-actions">
                  <button type="button" className="ad-btn ad-btn-ghost ad-btn-icon" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Up">
                    <Ic n="up" />
                  </button>
                  <button type="button" className="ad-btn ad-btn-ghost ad-btn-icon" onClick={() => move(i, i + 1)} disabled={i === weeks.length - 1} aria-label="Down">
                    <Ic n="down" />
                  </button>
                  <button type="button" className="ad-btn ad-btn-sm" onClick={() => setEditing(w)}>Edit</button>
                  <ConfirmButton
                    className="ad-btn ad-btn-ghost ad-btn-icon"
                    title={`Delete “${w.label}”?`}
                    body="The week and its picks are removed."
                    onConfirm={async () => {
                      const res = await deleteWeek(w.id)
                      toast(res.ok ? 'Week deleted' : res.error ?? 'Failed', res.ok ? 'ok' : 'error')
                      if (res.ok) router.refresh()
                    }}
                  />
                </span>
              </div>
            ))}
          </div>

          {!weeks.length && <p className="ad-muted" style={{ padding: 18 }}>No weeks yet. Add one to fill the Book of the Week section.</p>}
        </div>
      </section>

      {orderDirty && (
        <div className="ad-sticky-save">
          <span className="ad-muted" style={{ fontSize: 12.6 }}>The order has changed — the first week is the one on the home page.</span>
          <span className="ad-right">
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={async () => {
                const res = await reorderWeeks(weeks.map((w) => w.id))
                toast(res.ok ? 'Order saved' : res.error ?? 'Failed', res.ok ? 'ok' : 'error')
                if (res.ok) { setOrderDirty(false); router.refresh() }
              }}
            >
              Save order
            </button>
          </span>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Edit — ${editing.label}` : 'New week'} wide>
        {editing && <WeekForm week={editing} books={books} media={media} folders={folders} supabaseUrl={supabaseUrl} onDone={() => { setEditing(null); router.refresh() }} />}
      </Modal>
    </>
  )
}

function WeekForm({
  week, books, media, folders, supabaseUrl, onDone,
}: {
  week: Week
  books: { id: string; title: string }[]
  media: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
  onDone: () => void
}) {
  const toast = useToast()
  const [picks, setPicks] = useState<WeekPick[]>(week.picks)

  return (
    <form
      action={async (fd) => {
        const res = await saveWeek(week.id || null, fd)
        toast(res.ok ? 'Week saved' : res.error ?? 'Could not save', res.ok ? 'ok' : 'error')
        if (res.ok) onDone()
      }}
    >
      <div className="ad-row">
        <Text label="Label" name="label" defaultValue={week.label} required placeholder="This Week" />
        <Text label="Date range" name="range_label" defaultValue={week.range_label} optional placeholder="Apr 28 – May 04, 2024" />
      </div>
      <input type="hidden" name="key" value={week.key} readOnly />
      <Select
        label="Status"
        name="status"
        defaultValue={week.status}
        options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Hidden' }]}
      />

      <div style={{ marginTop: 16 }}>
        <Field label="Picks" hint="Link to a book on the site, or type the details for a title that isn't in the library.">
          <Repeater
            name="picks"
            value={picks as unknown as Record<string, unknown>[]}
            onChange={(v) => setPicks(v as unknown as WeekPick[])}
            blank={() => ({ book_id: '', title: '', author: '', genre: '', pages: '', published_label: '', cover_id: '' })}
            itemLabel={(i) => picks[i]?.title || `Pick ${i + 1}`}
            addLabel="Add pick"
            render={(row, set) => {
              const p = row as unknown as WeekPick
              return (
                <>
                  <Field label="Existing book">
                    <select
                      className="ad-select"
                      value={p.book_id}
                      onChange={(e) => {
                        const b = books.find((x) => x.id === e.target.value)
                        set({ book_id: e.target.value, title: b?.title ?? p.title } as never)
                      }}
                    >
                      <option value="">— not in the library —</option>
                      {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </Field>
                  <div className="ad-row">
                    <Field label="Title"><input className="ad-input" value={p.title} onChange={(e) => set({ title: e.target.value } as never)} /></Field>
                    <Field label="Author"><input className="ad-input" value={p.author} onChange={(e) => set({ author: e.target.value } as never)} /></Field>
                  </div>
                  <div className="ad-row">
                    <Field label="Genre"><input className="ad-input" value={p.genre} onChange={(e) => set({ genre: e.target.value } as never)} /></Field>
                    <Field label="Pages"><input className="ad-input" type="number" value={p.pages} onChange={(e) => set({ pages: e.target.value } as never)} /></Field>
                    <Field label="Published"><input className="ad-input" value={p.published_label} onChange={(e) => set({ published_label: e.target.value } as never)} /></Field>
                  </div>
                  <MediaPicker
                    name={`__cover_${p.title}`}
                    label="Cover"
                    value={media.find((m) => m.id === p.cover_id) ?? null}
                    items={media}
                    folders={folders}
                    supabaseUrl={supabaseUrl}
                    optional
                  />
                  <input type="hidden" value={p.cover_id} readOnly />
                </>
              )
            }}
          />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Submit>Save week</Submit>
      </div>
    </form>
  )
}
