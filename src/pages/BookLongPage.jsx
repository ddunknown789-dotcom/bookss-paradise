import { useState, useEffect } from 'react'
import { relatedBooks, bookHref } from '../data/books'
import { I, Stars, SOCIALS, BookSidebar, BookTopBar, BookQuote } from '../components/bookUi'
import '../styles/book.css'

/* One shell for both long-form pages. `kind` picks which body renders:
   'review'  -> /books/<slug>/review
   'summary' -> /books/<slug>/summary                                        */
export default function BookLongPage({ book, kind }) {
  const [copied, setCopied] = useState(false)
  const isReview = kind === 'review'
  const data = isReview ? book.fullReview : book.fullSummary
  const pageName = isReview ? 'Full Review' : 'Full Book Summary'
  const related = relatedBooks(book.slug)

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const prev = document.title
    document.title = `${pageName}: ${book.title} | Books Paradise`
    return () => { document.title = prev }
  }, [book.title, pageName])

  const copyLink = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(window.location.href).then(done).catch(done)
    else done()
  }

  const metaRows = [
    { icon: 'pen', label: 'Author', value: book.author },
    { icon: 'calendar', label: 'Published', value: book.published },
    { icon: 'pages', label: 'Pages', value: book.pages },
    { icon: 'language', label: 'Language', value: book.language },
    { icon: 'genre', label: 'Genre', value: book.genre },
  ]

  return (
    <div className="bp bp-long">
      <BookSidebar />

      <main className="bp-main">
        <BookTopBar
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Books', href: '/books' },
            { label: book.title, href: bookHref(book) },
            { label: pageName },
          ]}
        />

        {/* ---- book identity strip ---- */}
        <section className="bp-card bp-lhero">
          <figure className="bp-lhero-cover">
            <img src={book.coverSrc} alt={`${book.title} cover`} />
          </figure>

          <div className="bp-lhero-info">
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
              <Stars value={book.rating} size={19} />
              <span>{book.rating} ({book.reviewCount} Reviews)</span>
            </div>

            <div className="bp-lhero-cta">
              <a className="bp-btn bp-btn-gold bp-btn-lg" href={bookHref(book)}>
                Back to Book
                <I.back width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </a>
              <a className="bp-btn bp-btn-ghost bp-btn-lg" href={bookHref(book)}>
                Book Details
                <I.book width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7"
                  strokeLinecap="round" strokeLinejoin="round" />
              </a>
            </div>
          </div>
        </section>

        <div className="bp-grid">
          {/* ================= main article ================= */}
          <div className="bp-col">
            <article className="bp-card bp-article">
              <header className="bp-article-head">
                <h2>{isReview ? 'Full Review by Books Paradise' : 'Full Book Summary'}</h2>
                <span className="bp-rule" aria-hidden="true"><i /><b /><i /></span>
              </header>

              {isReview
                ? data.intro.map((p, i) => <p className="bp-lede" key={i}>{p}</p>)
                : <p className="bp-lede">{data.intro}</p>}

              {data.sections.map((s) => (
                <section className="bp-article-sec" key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </section>
              ))}

              {isReview && (
                <>
                  <section className="bp-article-sec">
                    <h3>What Worked Brilliantly</h3>
                    <ul className="bp-ticks">
                      {data.worked.map((x) => (
                        <li key={x}>
                          <I.check width="17" height="17" fill="none" stroke="#2f8f5b" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />{x}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bp-article-sec">
                    <h3>What Could Be Better</h3>
                    <ul className="bp-ticks">
                      {data.better.map((x) => (
                        <li key={x}>
                          <I.minus width="17" height="17" fill="none" stroke="#d05b4a" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />{x}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bp-article-sec">
                    <h3>Final Verdict</h3>
                    <p>{data.verdict}</p>
                  </section>
                </>
              )}

              <blockquote className="bp-article-quote">
                <span aria-hidden="true">“</span>
                <p>“{data.quote}”</p>
              </blockquote>

              {isReview ? (
                <section className="bp-scorecard">
                  <div className="bp-scorecard-total">
                    <span>Our Rating</span>
                    <strong>{book.review.overall}<em> / 5</em></strong>
                    <Stars value={book.review.overall} size={21} />
                  </div>
                  <ul className="bp-bars">
                    {data.bars.map((b) => (
                      <li key={b.label}>
                        <span>{b.label}</span>
                        <span className="bp-bar" aria-hidden="true">
                          <i style={{ width: `${(b.value / 5) * 100}%` }} />
                        </span>
                        <b>{b.value.toFixed(1)}</b>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <section className="bp-takeaways">
                  <header className="bp-article-head">
                    <h2>Key Takeaways</h2>
                    <span className="bp-rule" aria-hidden="true"><i /><b /><i /></span>
                  </header>
                  <div className="bp-takeaway-grid">
                    {data.takeaways.map((t) => {
                      const Ico = I[t.icon] || I.book
                      return (
                        <article key={t.title}>
                          <Ico width="24" height="24" fill="none" stroke="#c9962f" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                          <h4>{t.title}</h4>
                          <p>{t.text}</p>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}
            </article>
          </div>

          {/* ================= side column ================= */}
          <div className="bp-col bp-col-aside">
            {/* watch & listen */}
            <section className="bp-card bp-watch">
              <h3>Watch &amp; Listen</h3>
              <ul>
                {book.videos.map((v) => (
                  <li key={v.label}>
                    <span className="bp-watch-thumb">
                      <img src={v.thumb} alt="" loading="lazy" />
                      <i aria-hidden="true"><I.play width="18" height="18" fill="#fff" /></i>
                    </span>
                    <span className="bp-watch-meta">
                      <strong>{v.label}</strong>
                      <span>{v.duration}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {!isReview && (
                <a className="bp-all-retailers" href={bookHref(book)}>
                  View all videos
                  <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </a>
              )}
            </section>

            {/* about the book */}
            <section className="bp-card bp-aboutlist">
              <h3>About the Book</h3>
              <ul>
                {metaRows.map((m) => {
                  const Ico = I[m.icon]
                  return (
                    <li key={m.label}>
                      <Ico width="19" height="19" fill="none" stroke="#c9962f" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                      <div>
                        <span>{m.label}</span>
                        <strong>{m.value}</strong>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

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

            {/* share */}
            <section className="bp-card bp-share">
              <h3>Share This {isReview ? 'Review' : 'Summary'}</h3>
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

            {/* more books */}
            <section className="bp-card bp-more">
              <h3>More Books You’ll Love</h3>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}>
                    <a href={bookHref(r)}>
                      <img src={r.coverSrc} alt="" loading="lazy" />
                      <span>
                        <strong>{r.title}</strong>
                        <em>{r.author}</em>
                        <span className="bp-more-rating">
                          <Stars value={r.rating} size={13} />
                          <b>{r.rating}</b>
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              {!isReview && (
                <a className="bp-all-retailers" href="/books">
                  Explore more books
                  <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </a>
              )}
            </section>
          </div>
        </div>

        <BookQuote />
      </main>
    </div>
  )
}
