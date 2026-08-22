'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { lockPageScroll } from './scrollLock'

/* ============================================================================
   Admin UI kit.

   Small, unstyled-by-default building blocks that every module composes. All
   the visual language lives in styles/admin.css, so a change there restyles
   the whole panel at once.
   ========================================================================== */

/* --------------------------------- icons ---------------------------------- */

export const I = {
  dashboard: <><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  book: <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H5.5A1.5 1.5 0 0 0 4 19.5z" /><path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H19v2H5.5A1.5 1.5 0 0 1 4 19.5z" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" /></>,
  star: <path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6 6.9 19.3l1-5.7-4.1-4 5.7-.8z" />,
  video: <><rect x="2.5" y="6" width="13" height="12" rx="2" /><path d="m15.5 11 6-3.5v9L15.5 13z" /></>,
  image: <><rect x="3" y="4.5" width="18" height="15" rx="2" /><circle cx="8.5" cy="10" r="1.8" /><path d="m4 17 5-4.5 4.5 4 3-2.5L20 18" /></>,
  layout: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 20V9" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  tag: <><path d="M3.5 11.4V4.5A1 1 0 0 1 4.5 3.5h6.9a1 1 0 0 1 .7.3l8.1 8.1a1 1 0 0 1 0 1.4l-6.9 6.9a1 1 0 0 1-1.4 0L3.8 12.1a1 1 0 0 1-.3-.7z" /><circle cx="7.8" cy="7.8" r="1.3" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4 4" /></>,
  seo: <><circle cx="12" cy="12" r="9" /><path d="M3.5 12h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" /></>,
  trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12" /></>,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 5.5v-1a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.3 7.8A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1 0 1.9-.2 2.7-.5" /><path d="m3.5 3.5 17 17" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  external: <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  logout: <><path d="M15 17v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v2" /><path d="M10 12h11M18 9l3 3-3 3" /></>,
  upload: <><path d="M12 16V4M8 8l4-4 4 4" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  folder: <path d="M3.5 6.5a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1z" />,
  grip: <><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></>,
  spinner: <path d="M12 3a9 9 0 1 0 9 9" />,
  reset: <><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.8 19a6.2 6.2 0 0 1 12.4 0" /><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.2M17.5 19a6.2 6.2 0 0 0-1.6-4.2" /></>,
  mic: <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" /><path d="M8 12h8M8 8h8M8 16h5" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></>,
} as const

export type IconName = keyof typeof I

export function Ic({ n, ...rest }: { n: IconName } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {I[n]}
    </svg>
  )
}

/* -------------------------------- toasts ---------------------------------- */

type Toast = { id: number; text: string; kind: 'ok' | 'error' }
const ToastCtx = createContext<(text: string, kind?: 'ok' | 'error') => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((text: string, kind: 'ok' | 'error' = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, text, kind }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="ad-toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`ad-toast ${t.kind === 'error' ? 'ad-toast-error' : ''}`}>
            <Ic n={t.kind === 'error' ? 'alert' : 'check'} style={{ width: 15, height: 15, flex: '0 0 auto' }} />
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* -------------------------------- buttons --------------------------------- */

/** Submit button that shows its own pending state — no wiring per form. */
export function Submit({
  children = 'Save changes',
  className = 'ad-btn ad-btn-primary',
  pendingText,
}: {
  children?: React.ReactNode
  className?: string
  pendingText?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending && <Ic n="spinner" className="ad-spin" />}
      {pending ? pendingText ?? 'Saving…' : children}
    </button>
  )
}

/* --------------------------------- modal ---------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
}) {
  // Callers pass an inline arrow, so `onClose` is a new function on every
  // render of the parent. Reading it through a ref keeps the effect below tied
  // to `open` alone — otherwise it tore down and re-applied the scroll lock on
  // every keystroke in the form behind the dialog.
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
    }
    document.addEventListener('keydown', onKey)
    const release = lockPageScroll()
    return () => {
      document.removeEventListener('keydown', onKey)
      release()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="ad-modal-veil" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ad-modal ${wide ? 'ad-modal-lg' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ad-modal-head">
          <h3>{title}</h3>
          <button type="button" className="ad-btn ad-btn-ghost ad-btn-icon" onClick={onClose} aria-label="Close">
            <Ic n="x" />
          </button>
        </div>
        {/* `data-lenis-prevent` is inert in the admin — the site's smooth-scroll
            wrapper does not run here — but the attribute costs nothing and
            keeps this dialog scrollable if it is ever reused on the site. */}
        <div className="ad-modal-body" data-lenis-prevent>
          {children}
        </div>
        {footer && <div className="ad-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* ------------------------------ pointer kind ------------------------------ */

/**
 * True only where a real pointer can press, hold and drag — a mouse or a
 * stylus. HTML5 drag-and-drop has no touch equivalent: on a phone the browser
 * reads a press-and-move on a `draggable` element as the start of a drag
 * session rather than as a scroll, so a list of draggable rows tall enough to
 * fill the screen becomes impossible to scroll past. Reordering on touch is
 * done with the up/down buttons instead.
 *
 * Starts false so the server-rendered markup and the first client render agree;
 * a phone then never sees `draggable` at all.
 */
export function useCanDrag() {
  const [can, setCan] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setCan(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return can
}

/** Destructive actions always ask first, and name what's being removed. */
export function ConfirmButton({
  onConfirm,
  label = 'Delete',
  title = 'Delete this?',
  body,
  confirmLabel = 'Delete',
  className = 'ad-btn ad-btn-danger ad-btn-sm',
  icon = true,
}: {
  onConfirm: () => void | Promise<void>
  label?: string
  title?: string
  body?: React.ReactNode
  confirmLabel?: string
  className?: string
  icon?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} title={label}>
        {icon && <Ic n="trash" />}
        {label && !icon ? label : null}
      </button>
      <Modal
        open={open}
        onClose={() => !busy && setOpen(false)}
        title={title}
        footer={
          <>
            <button type="button" className="ad-btn" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await onConfirm()
                  setOpen(false)
                } finally {
                  setBusy(false)
                }
              }}
            >
              {busy && <Ic n="spinner" className="ad-spin" />}
              {busy ? 'Working…' : confirmLabel}
            </button>
          </>
        }
      >
        <p className="ad-muted">{body ?? 'This cannot be undone.'}</p>
      </Modal>
    </>
  )
}

/* --------------------------------- fields --------------------------------- */

/**
 * One labelled control.
 *
 * `optional` marks a field the site will simply leave out when it is empty —
 * no label with nothing beside it, no blank line, no broken image. The chip
 * says so, and says it the same way on every screen, so an editor can clear
 * anything they don't have and trust the page to close up behind it.
 */
export function Field({
  label,
  hint,
  optional,
  children,
  id,
}: {
  label: string
  hint?: React.ReactNode
  optional?: boolean
  children: React.ReactNode
  id?: string
}) {
  return (
    <div className="ad-field">
      <label className="ad-label" htmlFor={id}>
        {label}
        {optional && <span className="ad-opt" title={OPTIONAL_TITLE}>optional</span>}
      </label>
      {children}
      {hint && <p className="ad-hint">{hint}</p>}
    </div>
  )
}

export const OPTIONAL_TITLE = 'Optional — leave it empty and it is left off the live page entirely.'

/**
 * The house rule, stated once at the top of an editing screen rather than
 * repeated under all forty fields.
 */
export function OptionalNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="ad-hint ad-optional-note">
      <Ic n="eyeOff" aria-hidden="true" />
      <span>
        {children ?? (
          <>
            Every field here is optional. <b>Leave one empty and it disappears from the live page</b> —
            no heading with nothing under it, no empty space where it used to be. Fill it back in and it
            returns. This works field by field, and separately for each entry.
          </>
        )}
      </span>
    </p>
  )
}

export function Text({
  label,
  name,
  hint,
  optional,
  ...rest
}: { label: string; name: string; hint?: React.ReactNode; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} optional={optional} id={name}>
      <input id={name} name={name} className="ad-input" {...rest} />
    </Field>
  )
}

export function Area({
  label,
  name,
  hint,
  optional,
  big,
  ...rest
}: { label: string; name: string; hint?: React.ReactNode; optional?: boolean; big?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} optional={optional} id={name}>
      <textarea id={name} name={name} className={`ad-textarea ${big ? 'ad-textarea-lg' : ''}`} {...rest} />
    </Field>
  )
}

/**
 * The button that empties a field which has no way of its own to be emptied.
 *
 * Kept in the layout when there is nothing to clear, rather than appearing and
 * disappearing: the field beside it would change width every time the last
 * character went, which reads as a glitch in the middle of typing.
 */
export function ClearFieldButton({
  label,
  onClear,
  filled,
}: {
  label: string
  onClear: () => void
  filled: boolean
}) {
  return (
    <button
      type="button"
      className="ad-btn ad-btn-ghost ad-btn-icon ad-clear"
      onClick={onClear}
      disabled={!filled}
      title={filled ? `Clear ${label.toLowerCase()}` : `No ${label.toLowerCase()} to clear`}
      aria-label={`Clear ${label.toLowerCase()}`}
    >
      <Ic n="x" />
    </button>
  )
}

/**
 * A date field that can actually be left blank.
 *
 * Every other optional field empties by selecting its text and deleting it. A
 * native date input does not: the keyboard can clear one, but nothing on screen
 * says so, and the picker a phone opens offers no way at all — so a date, alone
 * among these fields, could be changed but never taken back off the page. Hence
 * the Clear beside it.
 */
export function DateField({
  label,
  name,
  hint,
  optional = true,
  defaultValue = '',
  ...rest
}: {
  label: string
  name: string
  hint?: React.ReactNode
  optional?: boolean
  defaultValue?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'type' | 'value' | 'onChange'>) {
  const [value, setValue] = useState(defaultValue)
  return (
    <Field label={label} hint={hint} optional={optional} id={name}>
      <div className="ad-clearable">
        <input
          id={name}
          name={name}
          type="date"
          className="ad-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...rest}
        />
        <ClearFieldButton label={label} filled={Boolean(value)} onClear={() => setValue('')} />
      </div>
    </Field>
  )
}

export function Select({
  label,
  name,
  hint,
  optional,
  options,
  ...rest
}: {
  label: string
  name: string
  hint?: React.ReactNode
  optional?: boolean
  options: { value: string; label: string }[]
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} hint={hint} optional={optional} id={name}>
      <select id={name} name={name} className="ad-select" {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function Check({
  label,
  name,
  hint,
  defaultChecked,
  ...rest
}: { label: string; name: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="ad-check">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} {...rest} />
      <span className="ad-check-text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}

/** Title field that fills a slug field beside it until the slug is hand-edited. */
export function SlugPair({
  titleName = 'title',
  slugName = 'slug',
  titleLabel = 'Title',
  defaultTitle = '',
  defaultSlug = '',
  prefix,
}: {
  titleName?: string
  slugName?: string
  titleLabel?: string
  defaultTitle?: string
  defaultSlug?: string
  prefix?: string
}) {
  const [title, setTitle] = useState(defaultTitle)
  const [slug, setSlug] = useState(defaultSlug)
  const touched = useRef(Boolean(defaultSlug))

  const auto = (v: string) =>
    v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <>
      <Text
        label={titleLabel}
        name={titleName}
        required
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          if (!touched.current) setSlug(auto(e.target.value))
        }}
      />
      <Text
        label="Slug"
        name={slugName}
        required
        value={slug}
        onChange={(e) => {
          touched.current = true
          setSlug(auto(e.target.value))
        }}
        hint={prefix ? <>The page address will be <code className="ad-mono">{prefix}{slug || '…'}</code></> : undefined}
      />
    </>
  )
}

/* --------------------------------- badges --------------------------------- */

export function Badge({ value }: { value: string }) {
  return (
    <span className={`ad-badge ad-badge-${value}`}>
      <i className="ad-badge-dot" />
      {value}
    </span>
  )
}

/* --------------------------------- empty ---------------------------------- */

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="ad-empty">
      <b>{title}</b>
      {body && <p>{body}</p>}
      {action}
    </div>
  )
}

/* ------------------------------ repeater ---------------------------------- */

/**
 * Generic add/remove/reorder list backed by a hidden JSON input, so a whole
 * nested collection posts with the surrounding form and needs no extra route.
 */
export function Repeater<T extends Record<string, unknown>>({
  name,
  value,
  onChange,
  blank,
  render,
  addLabel = 'Add row',
  itemLabel = (i: number) => `Row ${i + 1}`,
}: {
  name: string
  value: T[]
  onChange: (next: T[]) => void
  blank: () => T
  render: (item: T, set: (patch: Partial<T>) => void, index: number) => React.ReactNode
  addLabel?: string
  itemLabel?: (i: number) => string
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return
    const next = [...value]
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    onChange(next)
  }
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(value)} readOnly />
      <div className="ad-rep">
        {value.map((item, i) => (
          <div className="ad-rep-item" key={i}>
            <div className="ad-rep-head">
              <b>{itemLabel(i)}</b>
              <span className="ad-right">
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-icon" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                  <Ic n="up" />
                </button>
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-icon" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label="Move down">
                  <Ic n="down" />
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn-ghost ad-btn-icon"
                  onClick={() => onChange(value.filter((_, x) => x !== i))}
                  aria-label="Remove"
                >
                  <Ic n="trash" />
                </button>
              </span>
            </div>
            {render(item, (patch) => onChange(value.map((v, x) => (x === i ? { ...v, ...patch } : v))), i)}
          </div>
        ))}
      </div>
      <button type="button" className="ad-btn ad-btn-sm" style={{ marginTop: 8 }} onClick={() => onChange([...value, blank()])}>
        <Ic n="plus" />
        {addLabel}
      </button>
    </div>
  )
}
