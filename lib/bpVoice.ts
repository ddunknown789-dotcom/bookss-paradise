// @ts-nocheck
//
// Verbatim port of the original JavaScript assistant. Self-contained and
// already working in production; its data now arrives from the CMS via
// setCatalog() instead of the old static files. Consumers are type-checked.

/* ============================================================================
   BP — speech in and out, on the browser's own Web Speech API.

   No service, no key, no audio leaving the device: synthesis uses the voices
   already installed on the visitor's OS/browser, and recognition uses whatever
   the browser provides. Both degrade to nothing on browsers that lack them —
   `canSpeak` / `canListen` are the guards the UI checks.
   ========================================================================== */

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

const Recognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
export const canListen = !!Recognition

/* ------------------------------- speaking ------------------------------- */

let voices = []
const loadVoices = () => {
  if (!canSpeak) return
  voices = window.speechSynthesis.getVoices() || []
}
if (canSpeak) {
  loadVoices()
  // Chrome populates the list asynchronously, well after first paint.
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)
}

// Browsers hand back everything installed, in no useful order — including
// macOS's joke voices. Left unranked, "Albert" reads your book reviews.

// Markers on the genuinely neural/cloud voices, which sound best by far.
const PREMIUM = ['natural', 'neural', 'premium', 'enhanced', 'google', 'siri', 'wavenet', 'online']
// Flat, low-bitrate fallbacks.
const POOR = ['compact', 'espeak', 'pico']
// The natural system voices worth reaching for when nothing premium exists.
const PREFERRED = [
  'samantha', 'alex', 'daniel', 'karen', 'moira', 'tessa', 'rishi', 'serena', 'fiona',
  'monica', 'mónica', 'paulina', 'jorge', 'juan', 'marisol',
  'anna', 'petra', 'markus', 'yannick', 'helena', 'katja',
  'lekha', 'veena', 'aditi', 'kiara',
  'zira', 'david', 'mark', 'hazel', 'susan', 'microsoft',
]
// macOS novelty voices, plus the newer stylised character set. Neither belongs
// on a premium book site.
const NOVELTY = [
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'fred',
  'good news', 'hysterical', 'jester', 'junior', 'kathy', 'organ', 'princess', 'ralph',
  'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox', 'bruce', 'agnes',
]
const STYLISED = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley']

const firstWord = (name) => String(name || '').toLowerCase().trim().split(/[\s(]/)[0]

/** Best-sounding installed voice for a BCP-47 tag, or null to let the OS pick. */
export function pickVoice(tag) {
  if (!canSpeak) return null
  if (!voices.length) loadVoices()
  const base = tag.split('-')[0].toLowerCase()
  const candidates = voices.filter((v) => v.lang?.toLowerCase().startsWith(base))
  if (!candidates.length) return null

  const score = (v) => {
    const full = `${v.name} ${v.voiceURI}`.toLowerCase()
    const head = firstWord(v.name)
    const named = (list) => list.some((n) => head === n || full.startsWith(n))
    let s = 0
    if (PREMIUM.some((g) => full.includes(g))) s += 6
    if (named(PREFERRED)) s += 4
    if (named(STYLISED)) s -= 3
    if (named(NOVELTY)) s -= 10
    if (POOR.some((b) => full.includes(b))) s -= 4
    // Region outranks the OS default flag: that flag often points at another
    // region's voice (an en-IN default answering an en-US request).
    if (v.lang?.toLowerCase() === tag.toLowerCase()) s += 3
    if (v.default) s += 2
    if (v.localService) s += 1 // no network round-trip, so no stutter
    return s
  }
  return [...candidates].sort((a, b) => score(b) - score(a))[0] || null
}

/** Strip the bits of BP's copy that shouldn't be read out loud. */
export function speakable(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/^[•\-]\s*/gm, '')
    .replace(/[★📖🙂]/gu, '')
    .replace(/·/g, ',')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel()
}

/**
 * Speak `text` in `tag`. Always cancels whatever is already playing, so a new
 * answer never overlaps the previous one.
 */
export function speak(text, tag = 'en-US', { onStart, onEnd } = {}) {
  if (!canSpeak) return
  const body = speakable(text)
  if (!body) return
  window.speechSynthesis.cancel()

  const u = new SpeechSynthesisUtterance(body)
  u.lang = tag
  const v = pickVoice(tag)
  if (v) u.voice = v
  // Slightly under default: the stock rate reads as clipped and robotic,
  // and the drop is what makes a synthetic voice sound like a person.
  u.rate = 0.97
  u.pitch = 1.02
  u.volume = 1
  u.onstart = () => onStart?.()
  u.onend = () => onEnd?.()
  u.onerror = () => onEnd?.()
  window.speechSynthesis.speak(u)
}

/* ------------------------------- listening ------------------------------ */

/**
 * One-shot dictation. Returns a handle with .stop(); the caller gets the
 * transcript through onResult and is always told when the mic closes.
 */
export function listen(tag = 'en-US', { onResult, onEnd, onError } = {}) {
  if (!Recognition) {
    onError?.('unsupported')
    return { stop() {} }
  }
  const rec = new Recognition()
  rec.lang = tag
  rec.interimResults = false
  rec.maxAlternatives = 1
  rec.continuous = false

  let done = false
  const finish = () => {
    if (done) return
    done = true
    onEnd?.()
  }

  rec.onresult = (e) => {
    const said = e.results?.[0]?.[0]?.transcript?.trim()
    if (said) onResult?.(said)
  }
  rec.onerror = (e) => {
    onError?.(e.error || 'error')
    finish()
  }
  rec.onend = finish

  try {
    rec.start()
  } catch {
    // start() throws if a previous session is still closing
    onError?.('busy')
    finish()
  }

  return {
    stop() {
      try { rec.stop() } catch { /* already stopped */ }
    },
  }
}
