'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { createClient } from '@/lib/supabase/client'
import { Ic, Modal, Empty, useToast, ConfirmButton } from './ui'
import { createFolder, deleteFolder, deleteMedia, registerMedia, reservePath, updateMedia } from '@/app/admin/(panel)/media/actions'

export type MediaItem = {
  id: string
  path: string
  filename: string
  kind: 'image' | 'video' | 'pdf' | 'audio' | 'other'
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  alt_text: string | null
  caption: string | null
  folder_id: string | null
  created_at: string
}

export type Folder = { id: string; name: string; slug: string }

export const publicUrl = (path: string, base: string) =>
  path.startsWith('http') ? path : `${base}/storage/v1/object/public/media/${path}`

const humanSize = (n: number | null) => {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${Math.round(n / 1024)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}

type Upload = { name: string; pct: number; error?: string }

/* ============================================================================
   The library. Doubles as the picker: pass `pick` and it becomes a chooser
   that reports the selected file back instead of managing it.
   ========================================================================== */

export default function MediaBrowser({
  items,
  folders,
  supabaseUrl,
  pick,
  accept,
  onRefresh,
}: {
  items: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
  /** Present = picker mode. */
  pick?: (item: MediaItem) => void
  accept?: 'image' | 'video' | 'pdf' | 'all'
  onRefresh?: () => void
}) {
  const toast = useToast()
  const [, startTransition] = useTransition()

  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState<string | 'all'>('all')
  const [kind, setKind] = useState<string>(accept && accept !== 'all' ? accept : 'all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<MediaItem | null>(null)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [newFolder, setNewFolder] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((m) => {
      if (kind !== 'all' && m.kind !== kind) return false
      if (folder !== 'all' && m.folder_id !== (folder === 'root' ? null : folder)) return false
      if (!q) return true
      return (
        m.filename.toLowerCase().includes(q) ||
        (m.alt_text ?? '').toLowerCase().includes(q) ||
        (m.caption ?? '').toLowerCase().includes(q)
      )
    })
  }, [items, query, folder, kind])

  /* ------------------------------ uploading ------------------------------ */

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files)
      if (!list.length) return

      setUploads(list.map((f) => ({ name: f.name, pct: 0 })))
      const supabase = createClient()
      let done = 0

      for (const [i, file] of list.entries()) {
        try {
          const path = await reservePath(folder === 'all' || folder === 'root' ? null : folder, file.name)

          // Images: read the natural size so the site can reserve layout space.
          let width: number | null = null
          let height: number | null = null
          if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
            try {
              const bmp = await createImageBitmap(file)
              width = bmp.width
              height = bmp.height
              bmp.close()
            } catch {
              /* not fatal — dimensions are a nicety */
            }
          }

          setUploads((u) => u.map((x, n) => (n === i ? { ...x, pct: 35 } : x)))

          const { error } = await supabase.storage
            .from('media')
            .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
          if (error) throw new Error(error.message)

          setUploads((u) => u.map((x, n) => (n === i ? { ...x, pct: 80 } : x)))

          const res = await registerMedia({
            path,
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            width,
            height,
            folderId: folder === 'all' || folder === 'root' ? null : folder,
          })
          if (!res.ok) throw new Error(res.error)

          setUploads((u) => u.map((x, n) => (n === i ? { ...x, pct: 100 } : x)))
          done++
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed'
          setUploads((u) => u.map((x, n) => (n === i ? { ...x, pct: 100, error: message } : x)))
        }
      }

      if (done) toast(`Uploaded ${done} file${done === 1 ? '' : 's'}`)
      setTimeout(() => setUploads([]), 2500)
      startTransition(() => onRefresh?.())
    },
    [folder, onRefresh, toast],
  )

  // Paste-to-upload: screenshots are the most common thing people want in.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? [])
      if (files.length) void uploadFiles(files)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [uploadFiles])

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const removeSelected = async () => {
    const res = await deleteMedia([...selected])
    if (!res.ok) {
      toast(res.error, 'error')
      return
    }
    toast(res.message ?? `Deleted ${res.data?.deleted} file${res.data?.deleted === 1 ? '' : 's'}`)
    setSelected(new Set())
    startTransition(() => onRefresh?.())
  }

  const accepts =
    accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : accept === 'pdf' ? 'application/pdf' : undefined

  return (
    <div>
      {/* ------------------------------ toolbar ---------------------------- */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 13 }}>
        <div className="ad-search" style={{ flex: '1 1 200px', minWidth: 160 }}>
          <Ic n="search" />
          <input
            className="ad-input"
            placeholder="Search files…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select className="ad-select" style={{ width: 'auto' }} value={folder} onChange={(e) => setFolder(e.target.value)}>
          <option value="all">All folders</option>
          <option value="root">Top level</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {(!accept || accept === 'all') && (
          <select className="ad-select" style={{ width: 'auto' }} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="audio">Audio</option>
          </select>
        )}

        <button type="button" className="ad-btn ad-btn-gold" onClick={() => fileInput.current?.click()}>
          <Ic n="upload" />
          Upload
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={accepts}
          hidden
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {/* --------------------------- drop target --------------------------- */}
      <div
        className={`ad-drop ${dragOver ? 'is-over' : ''}`}
        style={{ marginBottom: 13, padding: dragOver ? '30px 18px' : '16px' }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files)
        }}
      >
        <b>{dragOver ? 'Drop to upload' : 'Drag files here'}</b>
        <p>You can drop several at once, or paste a screenshot.</p>
      </div>

      {!!uploads.length && (
        <div className="ad-panel" style={{ marginBottom: 13 }}>
          <div className="ad-panel-body" style={{ padding: '9px 14px' }}>
            {uploads.map((u, i) => (
              <div className="ad-upload-row" key={i}>
                <span style={{ width: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                {u.error ? (
                  <span style={{ color: 'var(--ad-danger)' }}>{u.error}</span>
                ) : (
                  <>
                    <span className="ad-bar"><i style={{ width: `${u.pct}%` }} /></span>
                    <span className="ad-faint">{u.pct}%</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------- selection bar --------------------------- */}
      {!pick && selected.size > 0 && (
        <div className="ad-alert ad-alert-info" style={{ marginBottom: 13, alignItems: 'center' }}>
          <span><b>{selected.size}</b> selected</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
            <button type="button" className="ad-btn ad-btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
            <ConfirmButton
              label="Delete selected"
              icon={false}
              className="ad-btn ad-btn-danger ad-btn-sm"
              title={`Delete ${selected.size} file${selected.size === 1 ? '' : 's'}?`}
              body="Files still used somewhere on the site will be kept and reported back to you."
              onConfirm={removeSelected}
            />
          </span>
        </div>
      )}

      {/* ----------------------------- folders ----------------------------- */}
      {!pick && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center', marginBottom: 13 }}>
          {folders.map((f) => (
            <span key={f.id} className="ad-badge" style={{ background: '#fff', border: '1px solid var(--ad-line)', gap: 7 }}>
              <Ic n="folder" style={{ width: 13, height: 13, stroke: 'var(--ad-faint)', fill: 'none', strokeWidth: 1.7 }} />
              {f.name}
              <ConfirmButton
                label=""
                className="ad-btn ad-btn-ghost"
                icon
                title={`Delete folder “${f.name}”?`}
                body="The files inside move back to the top level — nothing is lost."
                onConfirm={async () => {
                  const res = await deleteFolder(f.id)
                  toast(res.ok ? 'Folder deleted' : res.error, res.ok ? 'ok' : 'error')
                  startTransition(() => onRefresh?.())
                }}
              />
            </span>
          ))}
          <span style={{ display: 'flex', gap: 5 }}>
            <input
              className="ad-input"
              style={{ width: 150, padding: '4px 9px', fontSize: 12.5 }}
              placeholder="New folder…"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
            />
            <button
              type="button"
              className="ad-btn ad-btn-sm"
              disabled={!newFolder.trim()}
              onClick={async () => {
                const res = await createFolder(newFolder)
                if (res.ok) {
                  setNewFolder('')
                  toast('Folder created')
                  startTransition(() => onRefresh?.())
                } else toast(res.error, 'error')
              }}
            >
              <Ic n="plus" />
            </button>
          </span>
        </div>
      )}

      {/* ------------------------------ grid ------------------------------- */}
      {visible.length ? (
        <div className="ad-media-grid">
          {visible.map((m) => {
            const isPicked = selected.has(m.id)
            return (
              <button
                type="button"
                key={m.id}
                className={`ad-media-tile ${isPicked ? 'is-picked' : ''}`}
                onClick={() => (pick ? pick(m) : setEditing(m))}
                title={pick ? `Use ${m.filename}` : `Edit ${m.filename}`}
              >
                <span className="ad-media-thumb">
                  {m.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={publicUrl(m.path, supabaseUrl)} alt={m.alt_text ?? ''} loading="lazy" />
                  ) : (
                    <span className="ad-media-kind">{m.kind.toUpperCase()}</span>
                  )}
                </span>
                <span className="ad-media-meta">
                  <b>{m.filename}</b>
                  <span>
                    {m.width && m.height ? `${m.width}×${m.height}` : m.kind}
                    {m.size_bytes ? ` · ${humanSize(m.size_bytes)}` : ''}
                  </span>
                </span>
                {!pick && (
                  <span
                    className="ad-media-check"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(m.id)
                    }}
                    role="checkbox"
                    aria-checked={isPicked}
                  >
                    {isPicked && <Ic n="check" style={{ width: 12, height: 12, stroke: 'currentColor', fill: 'none', strokeWidth: 2.5 }} />}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <Empty
          title={items.length ? 'Nothing matches' : 'No files yet'}
          body={items.length ? 'Try a different search or folder.' : 'Drag files onto the area above, or use the Upload button.'}
        />
      )}

      {/* ------------------------------ editor ----------------------------- */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="File details">
        {editing && (
          <form
            action={async (fd) => {
              const res = await updateMedia(editing.id, fd)
              toast(res.ok ? 'Saved' : res.error, res.ok ? 'ok' : 'error')
              if (res.ok) {
                setEditing(null)
                startTransition(() => onRefresh?.())
              }
            }}
          >
            {editing.kind === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicUrl(editing.path, supabaseUrl)}
                alt=""
                style={{ width: '100%', maxHeight: 240, objectFit: 'contain', background: '#f2efe7', borderRadius: 8, marginBottom: 14 }}
              />
            )}

            <div className="ad-field">
              <label className="ad-label" htmlFor="filename">Name</label>
              <input id="filename" name="filename" className="ad-input" defaultValue={editing.filename} required />
            </div>

            <div className="ad-field">
              <label className="ad-label" htmlFor="alt_text">
                Alt text <span className="ad-opt">for screen readers &amp; SEO</span>
              </label>
              <input id="alt_text" name="alt_text" className="ad-input" defaultValue={editing.alt_text ?? ''} />
              <p className="ad-hint">Describe what the image shows. Leave empty for purely decorative images.</p>
            </div>

            <div className="ad-field">
              <label className="ad-label" htmlFor="caption">Caption <span className="ad-opt">optional</span></label>
              <input id="caption" name="caption" className="ad-input" defaultValue={editing.caption ?? ''} />
            </div>

            <div className="ad-field">
              <label className="ad-label" htmlFor="folder_id">Folder</label>
              <select id="folder_id" name="folder_id" className="ad-select" defaultValue={editing.folder_id ?? ''}>
                <option value="">Top level</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <p className="ad-hint ad-mono" style={{ marginTop: 12 }}>
              {editing.path} · {humanSize(editing.size_bytes)} · {editing.mime_type}
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
              <ConfirmButton
                label="Delete"
                icon={false}
                className="ad-btn ad-btn-danger"
                title={`Delete ${editing.filename}?`}
                body="If it's still used anywhere on the site, the delete is refused and you'll be told where."
                onConfirm={async () => {
                  const res = await deleteMedia([editing.id])
                  toast(res.ok ? res.message ?? 'Deleted' : res.error, res.ok ? 'ok' : 'error')
                  if (res.ok) {
                    setEditing(null)
                    startTransition(() => onRefresh?.())
                  }
                }}
              />
              <button type="button" className="ad-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="ad-btn ad-btn-primary">Save</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
