'use client'

/* Shapes the assistant exchanges with lib/bpBrain. */
type Chip = { label: string; send?: string; intent?: string; data?: unknown; href?: string }
type Card = { kind: string; title: string; meta: string; href: string; cover?: string }
type Turn = {
  id: string
  from: 'bp' | 'you'
  text: string
  lang?: string
  chips?: Chip[]
  cards?: Card[]
}

/* ============================================================================
   BP — the floating site assistant.

   Mounted once, on every route (see App.jsx), as a fixed overlay: it never
   participates in page layout, so no existing section can shift because of it.
   Knowledge lives in lib/bpBrain.js, copy in lib/bpLang.js, speech in
   lib/bpVoice.js; this file is the interface that ties them together.
   ========================================================================== */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { greeting, respond, defaultChips } from '@/lib/bpBrain'
import { LANGS, pack } from '@/lib/bpLang'
import { canListen, canSpeak, listen, speak, stopSpeaking } from '@/lib/bpVoice'
import { NOANIM } from '@/lib/anim'
import '@/styles/chat.css'

const nextId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

const LANG_KEY = 'bp-chat-lang'
const VOICE_KEY = 'bp-chat-voice'

const readStored = (key: string, fallback: string) => {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
const store = (key: string, value: string) => {
  try { localStorage.setItem(key, value) } catch { /* private mode */ }
}

/* Tiny formatter: **bold**, blank line = new paragraph, single newline = a
   soft break inside one. That's the whole of BP's copy vocabulary. */
const bold = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((chunk: string, j: number) =>
    chunk.startsWith('**') && chunk.endsWith('**') ? <strong key={j}>{chunk.slice(2, -2)}</strong> : chunk,
  )

function RichText({ value }: { value: string }) {
  return String(value).split(/\n{2,}/).map((block: string, i: number) => (
    <p key={i}>
      {block.split('\n').map((line: string, j: number) => (
        <span key={j}>
          {j > 0 && <br />}
          {bold(line)}
        </span>
      ))}
    </p>
  ))
}

function Monogram({ className }: { className?: string }) {
  return (
    <span className={`bpc-mono ${className || ''}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" focusable="false">
        <defs>
          <linearGradient id="bpc-g" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#F2DCA2" />
            <stop offset="0.5" stopColor="#D9AE52" />
            <stop offset="1" stopColor="#B8862A" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="23" fill="none" stroke="url(#bpc-g)" strokeWidth="1.6" opacity=".75" />
        <text
          x="24" y="24" textAnchor="middle" dominantBaseline="central"
          fill="url(#bpc-g)" fontFamily="'Playfair Display', Georgia, serif"
          fontSize="19" fontWeight="600" letterSpacing="0.5"
        >
          BP
        </text>
      </svg>
    </span>
  )
}

const Icon = ({ d, ...rest }: { d: React.ReactNode } & Omit<React.SVGProps<SVGSVGElement>, 'd'>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...rest}>
    {d}
  </svg>
)

const ICONS = {
  reset: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  send: <path d="M4 12h15M12.5 5.5 19 12l-6.5 6.5" />,
  speakerOn: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.8a4.5 4.5 0 0 1 0 6.4M19 6a8 8 0 0 1 0 12" /></>,
  speakerOff: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 9.5l4 5M21 9.5l-4 5" /></>,
  mic: <><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" /></>,
}

export default function BPChat() {
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [nudge, setNudge] = useState(false)
  const [langMenu, setLangMenu] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [notice, setNotice] = useState('')

  // These three start at the values the SERVER renders and only then adopt the
  // visitor's own — localStorage and navigator.language don't exist during SSR,
  // so reading them in a useState initialiser makes the first client render
  // disagree with the server HTML. React answers a mismatch by throwing the
  // server tree away and re-rendering everything on the client, which on a
  // phone is a whole-page reflow the visitor sees as a jolt.
  const [voice, setVoice] = useState(true)
  const [lang, setLang] = useState('en')
  const [msgs, setMsgs] = useState<Turn[]>(() => [{ id: nextId(), from: 'bp', lang: 'en', ...greeting('en') }])

  // Voice is on by default, as asked — but a visitor's own choice wins on
  // every later visit, so a mute is never silently undone. Runs once, after
  // hydration has matched, and only touches what actually differs.
  useEffect(() => {
    if (readStored(VOICE_KEY, NOANIM ? '0' : '1') !== '1') setVoice(false)

    const saved = readStored(LANG_KEY, '')
    // fall in behind the browser's own language when we speak it
    const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').slice(0, 2)
    const wanted = LANGS.some((l) => l.code === saved)
      ? saved
      : LANGS.some((l) => l.code === nav)
        ? nav
        : 'en'
    if (wanted === 'en') return

    // The panel is closed on load, so re-greeting in the visitor's language is
    // invisible — they open it and BP is already speaking the right one.
    setLang(wanted)
    setMsgs([{ id: nextId(), from: 'bp', lang: wanted, ...greeting(wanted) }])
  }, [])

  const p = useMemo(() => pack(lang), [lang])
  const speechTag = useMemo(() => LANGS.find((l: (typeof LANGS)[number]) => l.code === lang)?.speech || 'en-US', [lang])

  const logRef = useRef<any>(null)
  const inputRef = useRef<any>(null)
  const launcherRef = useRef<any>(null)
  const micRef = useRef<any>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const langBtnRef = useRef<any>(null)

  /* ------------------------------ lifecycle ----------------------------- */

  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    micRef.current?.stop()
    stopSpeaking()
  }, [])

  /* A single, gentle attention nudge — once per session, never again. */
  useEffect(() => {
    if (sessionStorage.getItem('bp-chat-seen')) return
    const t = setTimeout(() => setNudge(true), 6000)
    return () => clearTimeout(t)
  }, [])

  const stickToBottom = useCallback(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  // `open` is a dependency too: the panel is hidden until it opens, so a
  // scroll applied while it was closed lands on a zero-height element.
  useLayoutEffect(stickToBottom, [msgs, typing, open, stickToBottom])

  /* Escape closes; focus moves into the composer on open and back out on close. */
  useEffect(() => {
    if (!open) {
      stopSpeaking()
      setSpeaking(false)
      micRef.current?.stop()
      setLangMenu(false)
      return
    }
    sessionStorage.setItem('bp-chat-seen', '1')
    setNudge(false)
    const t = setTimeout(() => inputRef.current?.focus(), 260)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (langMenu) { setLangMenu(false); langBtnRef.current?.focus(); return }
      setOpen(false)
      launcherRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, langMenu])

  /* Phones open the panel as a sheet over the page, so hold the page still
     behind it. Desktop keeps scrolling — the panel is only a corner. */
  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 680px)').matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  /* Close the language menu on any outside click. */
  useEffect(() => {
    if (!langMenu) return
    const onDown = (e: Event) => {
      if (!(e.target as HTMLElement)?.closest?.('.bpc-lang')) setLangMenu(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [langMenu])

  /* ------------------------------- speech ------------------------------- */

  // Mirrors of the two settings a delayed reply needs to read. A `setState`
  // updater must stay pure (React invokes it twice in development), so the
  // "what language / is voice on" lookup happens through refs instead.
  const langRef = useRef(lang)
  const voiceRef = useRef(voice)
  useEffect(() => { langRef.current = lang }, [lang])
  useEffect(() => { voiceRef.current = voice }, [voice])

  const tagFor = (code: string) => LANGS.find((l: (typeof LANGS)[number]) => l.code === code)?.speech || 'en-US'

  const say = useCallback((text: string, code?: string) => {
    if (!voiceRef.current || !canSpeak) return
    speak(text, tagFor(code ?? langRef.current), {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    })
  }, [])

  const toggleVoice = () => {
    setVoice((on) => {
      const next = !on
      store(VOICE_KEY, next ? '1' : '0')
      if (!next) { stopSpeaking(); setSpeaking(false) }
      return next
    })
  }

  const toggleMic = () => {
    if (listening) {
      micRef.current?.stop()
      return
    }
    stopSpeaking()
    setSpeaking(false)
    setNotice('')
    setListening(true)
    micRef.current = listen(speechTag, {
      onResult: (said: string) => send(said),
      onEnd: () => setListening(false),
      onError: (err: string) => {
        setListening(false)
        if (err === 'unsupported') setNotice(p.ui.micUnsupported)
      },
    })
  }

  /* ------------------------------ messaging ----------------------------- */

  const send = useCallback(
    (raw: string, forced: { intent: string; data?: unknown } | null = null) => {
      const text = String(raw || '').trim()
      if (!text) return
      setDraft('')
      setNotice('')
      stopSpeaking()
      setSpeaking(false)
      setMsgs((m) => [...m, { id: nextId(), from: 'you', text }])
      setTyping(true)
      // A beat of "thinking" keeps the exchange feeling like a conversation
      // rather than a lookup table.
      const wait = 380 + Math.min(text.length * 12, 520)
      const t = setTimeout(() => {
        setTyping(false)
        // Read the language at reply time, so a switch made while BP was
        // "thinking" is honoured rather than answered in the language just left.
        const activeLang = langRef.current
        const reply = respond(text, activeLang, forced as never)
        setMsgs((m) => [...m, { id: nextId(), from: 'bp', lang: activeLang, ...reply }])
        say(reply.text, activeLang)
      }, wait)
      timers.current.push(t)
    },
    [say],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(draft)
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    stopSpeaking()
    setSpeaking(false)
    setTyping(false)
    setMsgs([{ id: nextId(), from: 'bp', lang, ...greeting(lang) }])
  }

  /* Switching language appends to the conversation rather than replacing it:
     what was already said stays exactly as it was said. */
  const chooseLang = (code: string) => {
    setLangMenu(false)
    langBtnRef.current?.focus()
    if (code === lang) return
    const np = pack(code)
    stopSpeaking()
    setSpeaking(false)
    langRef.current = code
    setLang(code)
    store(LANG_KEY, code)
    setMsgs((m) => [...m, { id: nextId(), from: 'bp', lang: code, text: np.ui.switched, chips: defaultChips(code) }])
    say(np.ui.switched, code)
  }

  const last = msgs[msgs.length - 1]
  const liveChips = !typing && last?.from === 'bp' ? last.chips : null
  const activeLang = LANGS.find((l: (typeof LANGS)[number]) => l.code === lang) || LANGS[0]

  return (
    <div className={`bpc ${open ? 'bpc-open' : ''}`}>
      <div
        className="bpc-panel"
        role="dialog"
        aria-modal="false"
        aria-label={`${p.ui.name} — ${p.ui.role}`}
        aria-hidden={!open}
        // keeps the closed panel out of the tab order and the a11y tree
        inert={open ? undefined : true}
        lang={lang}
      >
        <header className="bpc-head">
          <Monogram className="bpc-head-mono" />
          <span className="bpc-head-text">
            <strong>{p.ui.name}</strong>
            <small>
              <i className={`bpc-dot ${speaking ? 'bpc-dot-live' : ''}`} aria-hidden="true" />
              {listening ? p.ui.listening : p.ui.role}
            </small>
          </span>

          <div className="bpc-lang">
            <button
              type="button"
              ref={langBtnRef}
              className="bpc-icon bpc-lang-btn"
              onClick={() => setLangMenu((v) => !v)}
              aria-label={p.ui.language}
              aria-expanded={langMenu}
              aria-haspopup="listbox"
              title={p.ui.language}
            >
              <Icon d={ICONS.globe} />
              <span className="bpc-lang-code">{activeLang.code.toUpperCase()}</span>
            </button>
            {langMenu && (
              <ul className="bpc-lang-menu" role="listbox" aria-label={p.ui.language}>
                {LANGS.map((l: (typeof LANGS)[number]) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={l.code === lang}
                      className={l.code === lang ? 'is-active' : ''}
                      onClick={() => chooseLang(l.code)}
                      lang={l.code}
                    >
                      <span>{l.native}</span>
                      <em>{l.code.toUpperCase()}</em>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canSpeak && (
            <button
              type="button"
              className={`bpc-icon ${voice ? 'is-on' : ''}`}
              onClick={toggleVoice}
              aria-pressed={voice}
              aria-label={voice ? p.ui.voiceOn : p.ui.voiceOff}
              title={voice ? p.ui.voiceOn : p.ui.voiceOff}
            >
              <Icon d={voice ? ICONS.speakerOn : ICONS.speakerOff} />
            </button>
          )}

          <button type="button" className="bpc-icon" onClick={reset} aria-label={p.ui.reset} title={p.ui.reset}>
            <Icon d={ICONS.reset} />
          </button>
          <button
            type="button"
            className="bpc-icon"
            onClick={() => { setOpen(false); launcherRef.current?.focus() }}
            aria-label={p.ui.close}
          >
            <Icon d={ICONS.close} />
          </button>
        </header>

        {/* data-lenis-prevent: the site's smooth-scroll wrapper otherwise
            swallows the wheel here and the transcript won't move. */}
        <div className="bpc-log" ref={logRef} data-lenis-prevent role="log" aria-live="polite" aria-atomic="false">
          {msgs.map((m: Turn) => (
            <div key={m.id} className={`bpc-turn bpc-${m.from}`} lang={m.lang || undefined}>
              {m.from === 'bp' && <Monogram className="bpc-turn-mono" />}
              <div className="bpc-bubble-wrap">
                <div className="bpc-bubble">
                  <RichText value={m.text} />
                </div>
                {!!m.cards?.length && (
                  <div className="bpc-cards">
                    {m.cards.map((c: Card) => (
                      <a className="bpc-card" href={c.href} key={`${c.kind}-${c.href}`} onClick={() => setOpen(false)}>
                        {c.cover && <img src={c.cover} alt="" loading="lazy" />}
                        <span className="bpc-card-body">
                          <em>{pack(m.lang || lang).say.cardKind[c.kind] || ''}</em>
                          <strong>{c.title}</strong>
                          <small>{c.meta}</small>
                        </span>
                        <Icon className="bpc-card-go" d={<path d="M5 12h13M13 6.5l6 5.5-6 5.5" />} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="bpc-turn bpc-bp">
              <Monogram className="bpc-turn-mono" />
              <div className="bpc-bubble bpc-typing" aria-label="…">
                <i /><i /><i />
              </div>
            </div>
          )}
        </div>

        {!!notice && <p className="bpc-notice">{notice}</p>}

        {!!liveChips?.length && (
          <div className="bpc-chips">
            {liveChips.map((c: Chip, i: number) =>
              c.href ? (
                <a className="bpc-chip bpc-chip-go" href={c.href} key={`${c.label}-${i}`} onClick={() => setOpen(false)}>
                  {c.label}
                </a>
              ) : (
                <button
                  type="button"
                  className="bpc-chip"
                  key={`${c.label}-${i}`}
                  onClick={() => send(c.send || c.label, c.intent ? { intent: c.intent, data: c.data } : null)}
                >
                  {c.label}
                </button>
              ),
            )}
          </div>
        )}

        <form className="bpc-compose" onSubmit={onSubmit}>
          {canListen && (
            <button
              type="button"
              className={`bpc-mic ${listening ? 'is-live' : ''}`}
              onClick={toggleMic}
              aria-label={listening ? p.ui.stopListening : p.ui.listen}
              aria-pressed={listening}
              title={listening ? p.ui.stopListening : p.ui.listen}
            >
              <Icon d={ICONS.mic} />
            </button>
          )}
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={listening ? p.ui.listening : p.ui.placeholder}
            aria-label={p.ui.placeholder}
            maxLength={300}
            lang={lang}
          />
          <button type="submit" aria-label={p.ui.send} disabled={!draft.trim()}>
            <Icon d={ICONS.send} />
          </button>
        </form>
      </div>

      <button
        type="button"
        ref={launcherRef}
        className={`bpc-launcher ${nudge ? 'bpc-nudge' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? p.ui.close : p.ui.open}
      >
        <span className="bpc-launcher-face">
          <Monogram />
          <Icon className="bpc-launcher-x" d={ICONS.close} />
        </span>
        <span className="bpc-ping" aria-hidden="true" />
      </button>
    </div>
  )
}
