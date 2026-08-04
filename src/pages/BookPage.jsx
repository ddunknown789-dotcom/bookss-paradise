import { useState, useEffect } from 'react'
import { I, Stars, SOCIALS, BookSidebar, BookTopBar, BookQuote } from '../components/bookUi'
import '../styles/book.css'

export default function BookPage({ book }) {
  const [wished, setWished] = useState(false)
  const [copied, setCopied] = useState(false)

  // Keep the tab title in step with the book being viewed.
  useEffect(() => {
    const prev = document.title
    document.title = `${book.title} — ${book.author} | Books Paradise`
    return () => { document.title = prev }
  }, [book.title, book.author])

  const copyLink = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(window.location.href).then(done).catch(done)
    else done()
  }

  const reviewHref = `/books/${book.slug}/review`
  const summaryHref = `/books/${book.slug}/summary`

  return (
    <div className="bp">
      <BookSidebar />

      <main className="bp-main">
        <BookTopBar
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Books', href: '/books' },
            { label: book.title },
          ]}
        />

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
                  <a className="bp-btn bp-btn-gold bp-btn-lg" href={reviewHref}>
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
              <a className="bp-all-retailers" href={summaryHref}>
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

              <a className="bp-all-retailers" href={reviewHref}>
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

        <BookQuote />
      </main>
    </div>
  )
}
