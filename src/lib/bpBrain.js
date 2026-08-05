/* ============================================================================
   BP — intent engine.

   Two stages, deliberately separate:
     route()   reads the message and decides WHAT was asked (language-agnostic
               ids + the matching site data)
     render()  turns that into WORDS in the active language, from bpLang.js

   That split is why adding a language never touches the matching logic, and
   why every answer stays anchored to real site data (books.js, interviews.js,
   weeks.js) rather than to hand-written prose that could drift out of date.

   Book titles, author names, genres, blurbs and dates are never translated —
   they're published content, and rewriting them would misrepresent the books.
   ========================================================================== */

import { BOOKS, bookHref } from '../data/books'
import { INTERVIEWS, interviewHref } from '../data/interviews'
import { CURRENT_WEEK, WEEKS_HREF } from '../data/weeks'
import { pack, KW, SERVICE_KW, SERVICE_IDS, AUTHOR_ONLY, FAQ_KW, MOOD_KW, GENRE_ALIASES } from './bpLang'

/* ------------------------------- helpers -------------------------------- */

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

// books.js stores dates as display strings ("Jan 12, 2023"); sort on a real value.
function publishedAt(book) {
  const m = /([a-z]{3})[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i.exec(book.published || '')
  if (!m) return 0
  return new Date(+m[3], MONTHS.indexOf(m[1].toLowerCase()), +m[2]).getTime()
}

const NEWEST = [...BOOKS].sort((a, b) => publishedAt(b) - publishedAt(a))
const TOP_RATED = [...BOOKS].sort((a, b) => b.rating - a.rating)
const NEWEST_INTERVIEWS = [...INTERVIEWS].sort((a, b) => (a.iso < b.iso ? 1 : -1))

// Lowercase, drop Latin accents, keep every other script intact — the
// 0300–036F range is Latin combining marks only, so Devanagari matras (which
// carry meaning) survive untouched.
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// English + the active language are always matched together: people type
// "reviews" or "thriller" mid-sentence whatever language they're chatting in.
const hit = (q, group, lang) =>
  [...(group.en || []), ...(lang !== 'en' ? group[lang] || [] : [])].some((w) => q.includes(norm(w)))

const has = (q, ...phrases) => phrases.some((p) => q.includes(norm(p)))

// Words too common to identify a title — "book" included, or every query
// would half-match The Last Bookmark.
const STOP = new Set(
  ('a an the of and or to in on for with my me i you your is are it its do does can could would about please show tell find give want ' +
    'looking look need read reading book books new best top get got have has any some more all like ' +
    'el la los las un una de del y o para con mi me te su es son libro libros nuevo mejor ' +
    'der die das ein eine und oder fur mit mein mir ist sind buch bucher neu beste ' +
    'ki ka ke ko me mein hai hain aur ya kitab kitaben')
    .split(' '),
)

const words = (s) => norm(s).split(' ').filter(Boolean)
const contentWords = (s) => words(s).filter((w) => !STOP.has(w) && w.length > 1)

/* ------------------------------- entities ------------------------------- */

const ALL_GENRES = [...new Set(BOOKS.flatMap((b) => b.genres || [b.genre]))]

function findGenre(q, lang) {
  for (const g of ALL_GENRES) {
    if (q.includes(norm(g))) return g
    const aliases = GENRE_ALIASES[g] || []
    if (aliases.some((a) => q.includes(norm(a)))) return g
  }
  return null
}

const MOOD_GENRES = {
  cozy: ['Cozy', 'Mystery', 'Contemporary', 'Literary'],
  dark: ['Gothic', 'Historical', 'Mystery', 'Suspense'],
  thrilling: ['Thriller', 'Suspense', 'Mystery'],
  romantic: ['Romance', 'Drama', 'Contemporary'],
  emotional: ['Drama', 'Literary', 'Historical', 'Wartime'],
  uplifting: ['Literary', 'Contemporary', 'Adventure'],
  escape: ['Adventure', 'Epic', 'Survival', 'Fantasy'],
  magical: ['Fantasy', 'Magic', 'Mythic', 'Epic'],
  thoughtful: ['Literary', 'Contemporary', 'Drama'],
  historical: ['Historical', 'Wartime', 'Gothic'],
}

function findMood(q, lang) {
  return Object.keys(MOOD_KW).find((id) => hit(q, MOOD_KW[id], lang)) || null
}

// Title match: every meaningful word of the title present in the query wins;
// otherwise the best partial above a confidence floor.
function findBook(q) {
  let best = null
  for (const b of BOOKS) {
    const title = norm(b.title)
    if (q.includes(title)) return b
    const tokens = contentWords(b.title)
    if (!tokens.length) continue
    const hits = tokens.filter((t) => q.includes(t)).length
    const score = hits / tokens.length
    if (score >= 0.75 && hits >= 1 && (!best || score > best.score)) best = { book: b, score }
  }
  return best ? best.book : null
}

function findAuthor(q) {
  for (const b of BOOKS) {
    const full = norm(b.author)
    if (q.includes(full)) return b.author
    const last = full.split(' ').pop()
    if (last.length > 3 && q.includes(last)) return b.author
  }
  return null
}

function findService(q, lang) {
  let best = null
  for (const id of SERVICE_IDS) {
    const group = SERVICE_KW[id]
    for (const phrase of [...(group.en || []), ...(lang !== 'en' ? group[lang] || [] : [])]) {
      const p = norm(phrase)
      if (q.includes(p) && (!best || p.length > best.len)) best = { id, len: p.length }
    }
  }
  return best ? best.id : null
}

const booksByGenre = (genre) =>
  BOOKS.filter((b) => (b.genres || [b.genre]).some((x) => norm(x) === norm(genre))).sort((a, b) => b.rating - a.rating)

const booksForMood = (moodId) => {
  const want = (MOOD_GENRES[moodId] || []).map(norm)
  return BOOKS.filter((b) => (b.genres || [b.genre]).some((g) => want.includes(norm(g))))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
}

/* ------------------------------ navigation ------------------------------ */

// Everything BP can take you to. `words` are the per-language triggers; the
// human-readable label comes from the active pack's `places`.
const PLACES = [
  { id: 'books', href: '/#books', words: { en: ['featured book', 'top pick', 'picks', 'featured'], es: ['destacado', 'destacados'], de: ['ausgewahlte', 'empfehlungen'], hi: ['चुनिंदा'] } },
  { id: 'all-books', href: '/books', words: { en: ['all books', 'collection', 'browse', 'library', 'catalogue', 'catalog', 'every book'], es: ['todos los libros', 'coleccion', 'biblioteca', 'catalogo'], de: ['alle bucher', 'sammlung', 'bibliothek', 'katalog'], hi: ['सभी किताबें', 'संग्रह', 'सारी किताबें'] } },
  { id: 'reviews', href: '/#reviews', words: { en: ['review section', 'reviews section', 'reviews'], es: ['seccion de resenas', 'resenas'], de: ['rezensionen'], hi: ['समीक्षाएँ', 'समीक्षाएं'] } },
  // deliberately not 'video' — that belongs to the video-review and
  // summary-video services, answered before this list is consulted
  { id: 'trailers', href: '/#trailers', words: { en: ['trailer', 'trailers', 'watch'], es: ['trailer', 'trailers'], de: ['trailer', 'buchtrailer'], hi: ['ट्रेलर'] } },
  { id: 'weeks', href: WEEKS_HREF, words: { en: ['book of the week', 'weekly', 'this week', 'week'], es: ['libro de la semana', 'semana'], de: ['buch der woche', 'woche'], hi: ['हफ़्ते की किताब', 'सप्ताह'] } },
  { id: 'interviews', href: '/#interviews', words: { en: ['interview', 'interviews', 'author'], es: ['entrevista', 'entrevistas', 'autor'], de: ['interview', 'autoren'], hi: ['इंटरव्यू', 'लेखक'] } },
  { id: 'community', href: '/#community', words: { en: ['community', 'readers', 'members'], es: ['comunidad', 'lectores'], de: ['community', 'leser'], hi: ['कम्युनिटी', 'पाठक'] } },
  { id: 'about', href: '/#about', words: { en: ['about', 'mission', 'who runs', 'team', 'story'], es: ['sobre', 'acerca', 'equipo', 'mision'], de: ['uber', 'team', 'mission'], hi: ['के बारे में', 'टीम'] } },
  { id: 'offer', href: '/#offer', words: { en: ['services', 'what we offer', 'offer', 'what you do'], es: ['servicios', 'que ofreceis', 'que ofrecen'], de: ['leistungen', 'angebot'], hi: ['सेवाएँ', 'सेवाएं'] } },
  { id: 'newsletter', href: '/#newsletter', words: { en: ['newsletter', 'subscribe', 'join', 'sign up', 'signup', 'mailing list', 'contact', 'email', 'get in touch'], es: ['boletin', 'suscribir', 'unete', 'contacto', 'correo'], de: ['newsletter', 'abonnieren', 'mitmachen', 'kontakt'], hi: ['न्यूज़लेटर', 'संपर्क', 'ईमेल'] } },
]

const placeHref = (id) => PLACES.find((p) => p.id === id)?.href || '/'

/* --------------------------------- route -------------------------------- */

function route(raw, lang) {
  const q = norm(raw)
  if (!q) return { intent: 'empty' }

  /* --- greetings and small talk --- */
  if (q.length < 30 && hit(q, KW.greet, lang)) return { intent: 'greeting' }
  if (hit(q, KW.thanks, lang)) return { intent: 'thanks' }
  if (hit(q, KW.capabilities, lang)) return { intent: 'capabilities' }

  /* --- author-side: promotion --- */
  const wantsPromo = hit(q, KW.promote, lang)
  const service = findService(q, lang)

  // "do you make trailers?" is a question about a service; "can you show me
  // reviews?" is a reader browsing. Both open the same way, so the browsing
  // verbs have to veto the capability reading.
  const asksCapability = hit(q, KW.capability, lang) && !hit(q, KW.browseVerb, lang)
  if (service && (wantsPromo || asksCapability)) return { intent: 'service', data: { id: service } }

  // Phrases that only ever name a service — a reader would never type them.
  if (service && AUTHOR_ONLY.some((p) => q.includes(norm(p)))) return { intent: 'service', data: { id: service } }

  /* --- FAQs run before the promo pitch, so "how do I submit my book?" gets
         the actual answer rather than the full service list --- */
  for (const key of Object.keys(FAQ_KW)) {
    if (hit(q, FAQ_KW[key], lang)) return { intent: 'faq', data: { key } }
  }

  if (wantsPromo) return { intent: 'promoAll' }

  /* --- a specific book by name --- */
  const book = findBook(q)
  if (book) {
    if (hit(q, KW.review, lang)) return { intent: 'bookReview', data: { book } }
    if (hit(q, KW.summary, lang)) return { intent: 'bookSummary', data: { book } }
    if (has(q, 'like', 'similar', 'more like', 'parecido', 'parecidos', 'similares', 'ahnlich', 'ahnliche', 'जैसी', 'मिलती')) {
      const list = BOOKS.filter((b) => b.slug !== book.slug && (b.genres || []).some((g) => (book.genres || []).includes(g)))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
      return { intent: 'similar', data: { book, list: list.length ? list : TOP_RATED.slice(0, 3) } }
    }
    return { intent: 'book', data: { book } }
  }

  /* --- an author by name --- */
  const author = findAuthor(q)
  if (author) {
    return {
      intent: 'author',
      data: {
        author,
        books: BOOKS.filter((b) => b.author === author),
        interview: INTERVIEWS.find((i) => i.author === author) || null,
      },
    }
  }

  /* --- latest / best --- */
  const wantsNew = hit(q, KW.latest, lang)
  const wantsBest = hit(q, KW.best, lang)
  if (wantsNew && hit(q, KW.interview, lang)) return { intent: 'latestInterviews' }
  if (wantsNew && hit(q, KW.review, lang)) return { intent: 'latestReviews' }
  if (wantsNew || wantsBest) return { intent: wantsBest ? 'topBooks' : 'latestBooks' }

  /* --- reviews / summaries / interviews / week, as sections --- */
  if (hit(q, KW.interview, lang)) return { intent: 'interviews' }
  if (hit(q, KW.summary, lang)) return { intent: 'summaries' }
  if (hit(q, KW.review, lang)) return { intent: 'reviewsIntro' }
  if (hit(q, KW.week, lang)) return { intent: 'week' }

  /* --- genre and mood --- */
  const genre = findGenre(q, lang)
  const mood = findMood(q, lang)
  const genreList = genre ? booksByGenre(genre).slice(0, 3) : []
  // A genre is the more precise read, but a one-book genre makes for a thin
  // answer — when the phrasing also carries a mood, that gives a fuller shelf.
  if (genreList.length >= 2 || (genreList.length && !mood)) {
    return { intent: 'genre', data: { genre, list: genreList } }
  }
  if (mood) {
    const list = booksForMood(mood)
    if (list.length) return { intent: 'mood', data: { mood, list } }
  }
  if (genreList.length) return { intent: 'genre', data: { genre, list: genreList } }
  if (hit(q, KW.recommend, lang)) return { intent: 'recommendAsk' }

  /* --- navigation --- */
  const place = PLACES.find((p) => hit(q, p.words, lang))
  if (place) return { intent: 'nav', data: { id: place.id, explicit: hit(q, KW.navVerb, lang) } }

  /* --- a named service on its own ("trailers?") --- */
  if (service) return { intent: 'service', data: { id: service } }

  return { intent: 'fallback' }
}

/* -------------------------------- render -------------------------------- */

const bookCard = (b, p) => ({
  kind: 'book',
  title: b.title,
  meta: `${b.author} · ${b.genre} · ★ ${b.rating}`,
  href: bookHref(b),
  cover: b.coverSrc,
})

const reviewCard = (b, p) => ({
  kind: 'review',
  title: b.title,
  meta: p.say.metaReview(b.review?.overall ?? b.rating),
  href: `${bookHref(b)}/review`,
  cover: b.coverSrc,
})

const summaryCard = (b, p) => ({
  kind: 'summary',
  title: b.title,
  meta: p.say.metaSummary(b.pages),
  href: `${bookHref(b)}/summary`,
  cover: b.coverSrc,
})

const interviewCard = (i) => ({
  kind: 'interview',
  title: i.title,
  meta: `${i.date} · ${i.minutes}`,
  href: interviewHref(i),
  cover: i.image,
})

// A chip either sends a new turn (with the intent pinned, so routing never
// has to re-parse a translated label) or opens a link.
const ask = (label, intent, data) => ({ label, send: label, intent, data })
const go = (label, href) => ({ label, href })

export function defaultChips(langCode) {
  const p = pack(langCode)
  return [
    ask(p.chips.latestBooks, 'latestBooks'),
    ask(p.chips.bookReviews, 'reviewsIntro'),
    ask(p.chips.authorInterviews, 'interviews'),
    ask(p.chips.promoteMyBook, 'promoAll'),
    ask(p.chips.contactUs, 'faq', { key: 'contact' }),
  ]
}

export const greeting = (langCode) => ({ text: pack(langCode).say.greeting, chips: defaultChips(langCode) })

function genreList(p) {
  const all = [...ALL_GENRES]
  return `${all.slice(0, -1).join(', ')} ${p.ui.and} ${all[all.length - 1]}`
}

function serviceReply(id, p, langCode) {
  const s = p.services[id]
  const chips = [ask(p.chips.allServices, 'promoAll'), go(p.chips.getStarted, '/#newsletter')]
  const sectionFor = { trailers: '/#trailers', interviews: '/#interviews', social: '/#offer' }[id]
  if (sectionFor) chips.unshift(go(p.chips.see(s.name), sectionFor))
  return {
    text: `**${s.name}**\n\n${s.blurb}\n\n${s.bullets.map((b) => `• ${b}`).join('\n')}\n\n${p.say.serviceOutro}`,
    chips,
  }
}

function recommendReply(list, lead, p) {
  return {
    text: `${lead}\n\n${p.say.startHere}`,
    cards: list.map((b) => bookCard(b, p)),
    chips: [ask(p.chips.somethingElse, 'recommendAsk'), go(p.chips.allBooks, '/books'), ask(p.chips.latestReviews, 'latestReviews')],
  }
}

function render({ intent, data = {} }, p, langCode) {
  const D = () => defaultChips(langCode)

  switch (intent) {
    case 'greeting':
      return { text: p.say.greeting, chips: D() }

    case 'thanks':
      return { text: p.say.thanks, chips: D() }

    case 'capabilities':
      return { text: p.say.capabilities, chips: D() }

    case 'service':
      return serviceReply(data.id, p, langCode)

    case 'promoAll':
      return {
        text: `${p.say.promoIntro}\n\n${SERVICE_IDS.map((id) => `• **${p.services[id].name}** — ${p.services[id].blurb}`).join('\n')}\n\n${p.say.promoOutro}`,
        chips: [
          ask(p.services.reviews.name, 'service', { id: 'reviews' }),
          ask(p.services.trailers.name, 'service', { id: 'trailers' }),
          ask(p.services.campaigns.name, 'service', { id: 'campaigns' }),
          go(p.chips.getStarted, '/#newsletter'),
        ],
      }

    case 'faq': {
      const body = p.faqs[data.key]
      const text = typeof body === 'function' ? body(genreList(p)) : body
      const chips = {
        contact: [go(p.chips.openJoin, '/#newsletter'), go(p.chips.about, '/#about'), ask(p.chips.promoteMyBook, 'promoAll')],
        submit: [go(p.chips.openJoin, '/#newsletter'), ask(p.chips.showServices, 'promoAll')],
        pricing: [go(p.chips.contactTeam, '/#newsletter'), ask(p.chips.showServices, 'promoAll')],
        timeline: [go(p.chips.contactTeam, '/#newsletter')],
        honest: [go(p.chips.allReviews, '/#reviews'), ask(p.chips.promoteMyBook, 'promoAll')],
        genres: [go(p.chips.allBooks, '/books'), ask(p.chips.promoteMyBook, 'promoAll')],
        indie: [go(p.chips.contactTeam, '/#newsletter'), ask(p.chips.showServices, 'promoAll')],
        formats: [go(p.chips.contactTeam, '/#newsletter')],
        about: [go(p.chips.about, '/#about'), ask(p.chips.whatCanYouDo, 'capabilities')],
      }[data.key]
      return { text, chips: chips || D() }
    }

    case 'book': {
      const b = data.book
      const iv = INTERVIEWS.find((i) => i.slug === b.slug)
      return {
        text: p.say.bookDetail(b),
        cards: [bookCard(b, p), reviewCard(b, p), ...(iv ? [interviewCard(iv)] : [])],
        chips: [ask(p.chips.readSummary, 'bookSummary', { book: b }), ask(p.chips.similar, 'similar', { book: b })],
      }
    }

    case 'bookReview': {
      const b = data.book
      const quote = (b.review?.text || b.about).slice(0, 160)
      return {
        text: p.say.reviewIntro(b, b.review?.overall ?? b.rating, quote),
        cards: [reviewCard(b, p)],
        chips: [
          ask(p.chips.readSummary, 'bookSummary', { book: b }),
          go(p.chips.bookPage, bookHref(b)),
          ask(p.chips.similar, 'similar', { book: b }),
        ],
      }
    }

    case 'bookSummary': {
      const b = data.book
      return {
        text: p.say.summaryIntro(b),
        cards: [summaryCard(b, p)],
        chips: [ask(p.chips.readReview, 'bookReview', { book: b }), go(p.chips.bookPage, bookHref(b))],
      }
    }

    case 'similar': {
      const b = data.book
      const list = data.list || BOOKS.filter((x) => x.slug !== b.slug).slice(0, 3)
      return recommendReply(list, p.say.similar(b.title, ((b.genres || [])[0] || '').toLowerCase()), p)
    }

    case 'author': {
      const theirs = data.books || []
      const what = theirs.length > 1 ? `${theirs.length}` : theirs[0]?.title || ''
      return {
        text: p.say.author(data.author, what, !!data.interview),
        cards: [...theirs.map((b) => bookCard(b, p)), ...(data.interview ? [interviewCard(data.interview)] : [])],
        chips: [go(p.chips.allInterviews, '/#interviews'), go(p.chips.allBooks, '/books')],
      }
    }

    case 'latestBooks':
    case 'topBooks': {
      const list = (intent === 'topBooks' ? TOP_RATED : NEWEST).slice(0, 3)
      return {
        text: intent === 'topBooks' ? p.say.topRated : p.say.freshest,
        cards: list.map((b) => bookCard(b, p)),
        chips: [ask(p.chips.bookOfWeek, 'week'), go(p.chips.allBooks, '/books'), ask(p.chips.latestReviews, 'latestReviews')],
      }
    }

    case 'latestReviews':
    case 'reviewsIntro':
      return {
        text: intent === 'latestReviews' ? p.say.latestReviews : p.say.reviewsIntro,
        cards: NEWEST.slice(0, 3).map((b) => reviewCard(b, p)),
        chips: [go(p.chips.allReviews, '/#reviews'), go(p.chips.allBooks, '/books')],
      }

    case 'summaries':
      return {
        text: p.say.summariesIntro,
        cards: NEWEST.slice(0, 3).map((b) => summaryCard(b, p)),
        chips: [go(p.chips.allBooks, '/books'), ask(p.chips.latestReviews, 'latestReviews')],
      }

    case 'interviews':
    case 'latestInterviews':
      return {
        text: intent === 'latestInterviews' ? p.say.latestInterviews : p.say.interviewsIntro,
        cards: NEWEST_INTERVIEWS.slice(0, 3).map(interviewCard),
        chips: [go(p.chips.allInterviews, '/#interviews'), ask(p.chips.latestBooks, 'latestBooks')],
      }

    case 'week': {
      const picks = (CURRENT_WEEK?.books || []).slice(0, 3)
      return {
        text: p.say.weekPicks(CURRENT_WEEK?.range || ''),
        cards: picks.map((x) => ({
          kind: 'book',
          title: x.title,
          meta: `${x.author} · ${x.genre}`,
          href: x.slug ? `/books/${x.slug}` : WEEKS_HREF,
          cover: x.coverSrc,
        })),
        chips: [go(p.chips.everyWeek, WEEKS_HREF), ask(p.chips.latestBooks, 'latestBooks')],
      }
    }

    case 'genre':
      return recommendReply(data.list, p.say.genreLead(data.genre), p)

    case 'mood':
      return recommendReply(data.list, p.say.moodLead(p.moods[data.mood]), p)

    case 'recommendAsk':
      return {
        text: p.say.recommendAsk,
        chips: [
          ask(p.chips.gripping, 'mood', { mood: 'thrilling', list: booksForMood('thrilling') }),
          ask(p.chips.cosy, 'mood', { mood: 'cozy', list: booksForMood('cozy') }),
          ask(p.chips.loveStory, 'mood', { mood: 'romantic', list: booksForMood('romantic') }),
          ask(p.chips.magical, 'mood', { mood: 'magical', list: booksForMood('magical') }),
          ask(p.chips.bestRated, 'topBooks'),
        ],
      }

    case 'nav': {
      const label = p.places[data.id] || data.id
      return {
        text: data.explicit ? p.say.navTo(label) : p.say.navPlain(label),
        chips: [go(p.chips.open(label), placeHref(data.id)), ask(p.chips.whatCanYouDo, 'capabilities')],
      }
    }

    case 'empty':
      return { text: p.say.empty, chips: D() }

    default:
      return { text: p.say.fallback, chips: D() }
  }
}

/* --------------------------------- api ---------------------------------- */

/**
 * @param raw     what the visitor typed or said
 * @param lang    active language code ('en' | 'es' | 'de' | 'hi')
 * @param forced  optional { intent, data } from a quick-reply chip, which
 *                skips matching entirely — a translated label never has to be
 *                re-parsed to find the intent behind it.
 */
export function respond(raw, lang = 'en', forced = null) {
  const p = pack(lang)
  return render(forced?.intent ? forced : route(raw, lang), p, lang)
}
