import { useState, useEffect } from 'react'
import { PAGE_QUOTE } from '../data/books'
import '../styles/book.css'

/* --- tiny inline icon set (stroke = currentColor, so they inherit) --- */
const I = {
  home: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>),
  books: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 4h6v16H4z" /><path d="M10 6h5l3 14-5 1z" /></svg>),
  reviews: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>),
  trailers: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="m10 8.5 6 3.5-6 3.5z" /></svg>),
  community: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="9" cy="9" r="3" /><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" /><path d="M16 7a3 3 0 0 1 0 6" /><path d="M18 20c0-2.5-1-4-3-4.6" /></svg>),
  about: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg>),
  search: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>),
  bell: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M18 15V10a6 6 0 0 0-12 0v5l-2 3h16z" /><path d="M10 21h4" /></svg>),
  user: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>),
  heart: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z" /></svg>),
  arrow: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>),
  pages: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /></svg>),
  calendar: (p) => (<svg viewBox="0 0 24 24" {...p}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>),
  language: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" /></svg>),
  genre: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 5h16v14H4z" /><path d="M4 9h16" /></svg>),
  spark: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M13 3 5 14h6l-2 7 8-11h-6z" /></svg>),
  twist: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M5 7h6a4 4 0 0 1 0 8H9" /><path d="m11 12-2 3 2 3" /><path d="M14 17h5" /></svg>),
  people: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" /></svg>),
  quill: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M20 4C10 6 6 11 5 20" /><path d="M20 4c0 8-5 12-11 12H5" /></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>),
  minus: (p) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 12h7" /></svg>),
  link: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="M10 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7L11 8" /><path d="M14 10a4 4 0 0 0-6-.5l-2 2A4 4 0 0 0 11.7 17L13 16" /></svg>),
  play: (p) => (<svg viewBox="0 0 24 24" {...p}><path d="m9 7 9 5-9 5z" /></svg>),
}

const SOCIALS = [
  { name: 'Facebook', d: 'M14 8h2V5h-2.5C11.6 5 10 6.6 10 8.5V11H8v3h2v6h3v-6h2.2l.5-3H13V9c0-.6.4-1 1-1z' },
  { name: 'Twitter', d: 'M20 7.5c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.7-2.1.8A3.3 3.3 0 0 0 11.7 10 9.3 9.3 0 0 1 5 6.6a3.3 3.3 0 0 0 1 4.4c-.5 0-1-.2-1.5-.4 0 1.6 1.1 2.9 2.6 3.2-.5.1-1 .2-1.5.1a3.3 3.3 0 0 0 3.1 2.3A6.6 6.6 0 0 1 4 17.6 9.3 9.3 0 0 0 9 19c6 0 9.4-5.1 9.2-9.6.6-.5 1.2-1.1 1.8-1.9z' },
  { name: 'Instagram', d: 'M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm4 4.8A3.2 3.2 0 1 0 15.2 12 3.2 3.2 0 0 0 12 8.8zm0 1.7A1.5 1.5 0 1 1 10.5 12 1.5 1.5 0 0 1 12 10.5zM16.4 7a.9.9 0 1 0 .9.9.9.9 0 0 0-.9-.9z' },
  { name: 'WhatsApp', d: 'M12 4a8 8 0 0 0-6.9 12L4 20l4.1-1.1A8 8 0 1 0 12 4zm4.3 11.2c-.2.5-1 .9-1.4 1-.4 0-.8.2-2.6-.6a9.3 9.3 0 0 1-3.8-3.5c-.3-.5-.7-1.3-.7-2s.4-1.1.6-1.3a.6.6 0 0 1 .5-.2h.4c.1 0 .3 0 .5.4l.6 1.5a.5.5 0 0 1 0 .5l-.3.4-.2.3a.3.3 0 0 0 0 .4 6.6 6.6 0 0 0 1.2 1.5 6 6 0 0 0 1.7 1c.2.1.4.1.5 0l.6-.7c.2-.2.3-.2.5-.1l1.5.7c.2.1.4.2.4.3a1.6 1.6 0 0 1 0 .9z' },
]

const NAV = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Books', icon: 'books', href: '/books' },
  { label: 'Reviews', icon: 'reviews', href: '/#reviews' },
  { label: 'Trailers', icon: 'trailers', href: '/#trailers' },
  { label: 'Community', icon: 'community', href: '/#community' },
  { label: 'About Us', icon: 'about', href: '/#about' },
]

/* Five stars with a fractional gold fill clipped over a muted base. */
function Stars({ value, size = 22 }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  const row = (cls) => (
    <span className={cls} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size}>
          <path d="M12 2.4l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.6l1.2-6.6L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  )
  return (
    <span className="bp-stars" style={{ '--pct': `${pct}%` }} role="img" aria-label={`${value} out of 5 stars`}>
      {row('bp-stars-base')}
      {row('bp-stars-fill')}
    </span>
  )
}

export default function BookPage({ book }) {
  const [wished, setWished] = useState(false)
  const [copied, setCopied] = useState(false)

  // Arriving from a book cover halfway down the home page, the browser would
  // otherwise restore that scroll position and drop you into the middle of
  // this page. Always open a book at its title.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  // Keep the tab title in step with the book being viewed.
  useEffect(() => {
    const prev = document.title
    document.title = `${book.title} — ${book.author} | Books Paradise`
    return () => { document.title = prev }
  }, [book.title, book.author])

  const copyLink = () => {
    const url = window.location.href
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(done)
    else done()
  }

  return (
    <div className="bp">
      {/* ---------------- left sidebar ---------------- */}
      <aside className="bp-side">
        <a className="bp-side-brand" href="/">Books Paradise</a>

        <a className="bp-side-badge" href="/" aria-label="Books Paradise home">
          <img src="/assets/logo.png" alt="" />
        </a>

        <nav className="bp-side-nav" aria-label="Primary">
          {NAV.map((n) => {
            const Ico = I[n.icon]
            return (
              <a key={n.label} href={n.href} className={n.label === 'Books' ? 'is-active' : ''}>
                <Ico width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
                <span>{n.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="bp-side-card">
          <h4>Love books?</h4>
          <p>You’re in the right place.</p>
          <a className="bp-btn bp-btn-gold bp-btn-sm" href="/#newsletter">Join Us</a>
          <img className="bp-side-card-art" src="/assets/icon-curated.png" alt="" />
        </div>

        <div className="bp-side-social">
          {SOCIALS.map((s) => (
            <a key={s.name} href="#" aria-label={s.name}>
              <svg viewBox="0 0 24 24" width="19" height="19"><path d={s.d} fill="currentColor" /></svg>
            </a>
          ))}
        </div>
      </aside>

      {/* ---------------- main ---------------- */}
      <main className="bp-main">
        <header className="bp-top">
          <nav className="bp-crumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <a href="/books">Books</a>
            <span>›</span>
            <em>{book.title}</em>
          </nav>
          <div className="bp-top-actions">
            <button type="button" aria-label="Search">
              <I.search width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </button>
            <button type="button" aria-label="Notifications">
              <I.bell width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </button>
            <button type="button" aria-label="Account">
              <I.user width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </button>
            <a className="bp-btn bp-btn-gold" href="/#newsletter">Join Our Community</a>
          </div>
        </header>

        <div className="bp-grid">
          {/* ============ primary column ============ */}
          <div className="bp-col">
            {/* hero */}
            <section className="bp-card bp-hero">
              <figure className="bp-hero-cover">
                <img src={book.coverSrc} alt={`${book.title} cover`} />
              </figure>

              <div className="bp-hero-info">
                <div className="bp-genres">
                  {book.genres.map((g, i) => (
                    <span key={g}>{g}{i < book.genres.length - 1 && <i>•</i>}</span>
                  ))}
                </div>

                <h1 className="bp-title">{book.title}</h1>

                <p className="bp-author">
                  by {book.author}
                  {book.verified && (
                    <span className="bp-verified" title="Verified author">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <circle cx="12" cy="12" r="10" fill="#c9962f" />
                        <path d="m8 12 2.6 2.6L16 9.4" fill="none" stroke="#fff" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </p>

                <div className="bp-rating">
                  <Stars value={book.rating} />
                  <span>{book.rating} ({book.reviewCount} Reviews)</span>
                </div>

                <blockquote className="bp-pull">
                  <span className="bp-pull-mark">“</span>
                  <div>
                    {book.pull.map((line, i) => (
                      <p key={i}>{line}{i === book.pull.length - 1 && '”'}</p>
                    ))}
                  </div>
                </blockquote>

                <div className="bp-hero-cta">
                  <a className="bp-btn bp-btn-gold bp-btn-lg" href="/#reviews">
                    Read Reviews
                    <I.arrow width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </a>
                  <button
                    type="button"
                    className={`bp-btn bp-btn-ghost bp-btn-lg${wished ? ' is-on' : ''}`}
                    onClick={() => setWished((v) => !v)}
                    aria-pressed={wished}
                  >
                    {wished ? 'Wishlisted' : 'Add to Wishlist'}
                    <I.heart width="18" height="18" fill={wished ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </button>
                </div>
              </div>
            </section>

            {/* videos */}
            <section className="bp-videos">
              {book.videos.map((v) => (
                <article className="bp-card bp-video" key={v.label}>
                  <h3>{v.label}</h3>
                  <div className="bp-video-thumb">
                    <img src={v.thumb} alt="" loading="lazy" />
                    <span className="bp-play" aria-hidden="true">
                      <I.play width="26" height="26" fill="#fff" />
                    </span>
                  </div>
                  <footer>
                    <span>{v.caption}</span>
                    <span>{v.duration}</span>
                  </footer>
                </article>
              ))}
            </section>

            {/* about */}
            <section className="bp-card bp-about">
              <div className="bp-about-copy">
                <h2>About the Book</h2>
                <p>{book.about}</p>

                <ul className="bp-meta">
                  <li>
                    <I.pages width="21" height="21" fill="none" stroke="#c9962f" strokeWidth="1.5" strokeLinejoin="round" />
                    <div><span>PAGES</span><strong>{book.pages}</strong></div>
                  </li>
                  <li>
                    <I.calendar width="21" height="21" fill="none" stroke="#c9962f" strokeWidth="1.5" strokeLinecap="round" />
                    <div><span>PUBLISHED</span><strong>{book.published}</strong></div>
                  </li>
                  <li>
                    <I.language width="21" height="21" fill="none" stroke="#c9962f" strokeWidth="1.5" />
                    <div><span>LANGUAGE</span><strong>{book.language}</strong></div>
                  </li>
                  <li>
                    <I.genre width="21" height="21" fill="none" stroke="#c9962f" strokeWidth="1.5" />
                    <div><span>GENRE</span><strong>{book.genre}</strong></div>
                  </li>
                </ul>
              </div>
              <figure className="bp-about-art">
                <img src={book.aboutImage} alt="" loading="lazy" />
              </figure>
            </section>

            {/* what makes it special */}
            <section className="bp-special">
              <h2>What Makes It Special</h2>
              <div className="bp-special-grid">
                {book.special.map((s) => {
                  const Ico = I[s.icon] || I.spark
                  return (
                    <article className="bp-card bp-special-card" key={s.title}>
                      <Ico width="24" height="24" fill="none" stroke="#c9962f" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                      <h4>{s.title}</h4>
                      <p>{s.text}</p>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>

          {/* ============ side column ============ */}
          <div className="bp-col bp-col-aside">
            {/* availability */}
            <section className="bp-card bp-avail">
              <h3>Book Availability</h3>
              <ul>
                {book.retailers.map((r) => (
                  <li key={r.name}>
                    <span className="bp-retailer-mark" style={{ color: r.tone }}>{r.mark}</span>
                    <span className="bp-retailer-name">{r.name}</span>
                    <a className="bp-btn bp-btn-gold bp-btn-xs" href={r.url}>{r.cta}</a>
                  </li>
                ))}
              </ul>
              <a className="bp-all-retailers" href="#">
                View all retailers
                <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </a>
            </section>

            {/* summary */}
            <section className="bp-card bp-summary">
              <h3>Book Summary</h3>
              {book.summaryLines.map((l) => <p className="bp-summary-line" key={l}>{l}</p>)}
              <p className="bp-summary-body">{book.summaryBody}</p>
              <a className="bp-all-retailers" href="#">
                Read More
                <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </a>
            </section>

            {/* our review */}
            <section className="bp-card bp-review">
              <h3>Book Review By Books Paradise</h3>
              <div className="bp-review-top">
                <img className="bp-review-avatar" src="/assets/logo-girl.png" alt="" />
                <p>{book.review.text}</p>
              </div>

              <div className="bp-verdict">
                <div className="bp-verdict-score">
                  <span>OVERALL RATING</span>
                  <strong>{book.review.overall}<em> / 5</em></strong>
                  <Stars value={book.review.overall} size={17} />
                </div>
                <div className="bp-verdict-list">
                  <span>What We Loved</span>
                  {book.review.loved.map((x) => (
                    <p key={x}>
                      <I.check width="16" height="16" fill="none" stroke="#2f8f5b" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />{x}
                    </p>
                  ))}
                </div>
                <div className="bp-verdict-list">
                  <span>What Could Be Better</span>
                  {book.review.better.map((x) => (
                    <p key={x}>
                      <I.minus width="16" height="16" fill="none" stroke="#d05b4a" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />{x}
                    </p>
                  ))}
                </div>
              </div>

              <a className="bp-all-retailers" href="/#reviews">
                Read Full Review
                <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </a>
            </section>

            {/* share */}
            <section className="bp-card bp-share">
              <h3>Share This Book</h3>
              <div className="bp-share-row">
                {SOCIALS.map((s) => (
                  <a key={s.name} href="#" aria-label={`Share on ${s.name}`}>
                    <svg viewBox="0 0 24 24" width="19" height="19"><path d={s.d} fill="currentColor" /></svg>
                  </a>
                ))}
                <button type="button" className="bp-copy" onClick={copyLink}>
                  {copied ? 'Copied!' : 'Copy Link'}
                  <I.link width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7"
                    strokeLinecap="round" strokeLinejoin="round" />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* quote banner */}
        <section className="bp-quote">
          <div className="bp-quote-copy">
            <span aria-hidden="true">“</span>
            <p>“{PAGE_QUOTE.text}”</p>
            <cite>– {PAGE_QUOTE.author}</cite>
          </div>
          <img src="/assets/icon-curated.png" alt="" loading="lazy" />
        </section>
      </main>
    </div>
  )
}
