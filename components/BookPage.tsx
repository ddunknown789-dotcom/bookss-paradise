'use client'

import type { BookView } from '@/lib/cms/types'

import { useState, useEffect } from 'react'
import { I, Stars, SOCIALS, BookSidebar, BookTopBar, BookQuote } from '@/components/bookUi'
import { has, hasList, hasNum } from '@/lib/cms/optional'
import '@/styles/book.css'

export default function BookPage({ book, quote, related }: { book: BookView; quote: { text: string; author: string }; related: BookView['related'] }) {
  const [wished, setWished] = useState(false)
  const [copied, setCopied] = useState(false)

  // Keep the tab title in step with the book being viewed. A book with no
  // author on file is titled by name alone rather than trailing an em dash.
  useEffect(() => {
    const prev = document.title
    document.title = has(book.author)
      ? `${book.title} — ${book.author} | Books Paradise`
      : `${book.title} | Books Paradise`
    return () => { document.title = prev }
  }, [book.title, book.author])

  const copyLink = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(window.location.href).then(done).catch(done)
    else done()
  }

  const reviewHref = `/books/${book.slug}/review`
  const summaryHref = `/books/${book.slug}/summary`

  // The facts strip under "About the Book". Anything the editor left blank
  // drops out here, so the row never carries a label with nothing beside it —
  // and the grid is told how many made it so the rest stay evenly spread.
  const facts = [
    { icon: 'pages', label: 'PAGES', value: hasNum(book.pages) ? String(book.pages) : '' },
    { icon: 'calendar', label: 'PUBLISHED', value: book.published },
    { icon: 'language', label: 'LANGUAGE', value: book.language },
    { icon: 'genre', label: 'GENRE', value: book.genre },
  ].filter((f) => has(f.value))

  const showAbout = has(book.about) || facts.length > 0 || has(book.aboutImage)
  const showReviewCard =
    has(book.review.text) || hasNum(book.review.overall) ||
    hasList(book.review.loved) || hasList(book.review.better)
  const verdictPanels =
    (hasNum(book.review.overall) ? 1 : 0) +
    (hasList(book.review.loved) ? 1 : 0) +
    (hasList(book.review.better) ? 1 : 0)

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
            <section className={`bp-card bp-hero${has(book.coverSrc) ? '' : ' is-textonly'}`}>
              {has(book.coverSrc) && (
                <figure className="bp-hero-cover">
                  <img src={book.coverSrc} alt={`${book.title} cover`} />
                </figure>
              )}

              <div className="bp-hero-info">
                {hasList(book.genres) && (
                  <div className="bp-genres">
                    {book.genres.map((g: any, i: number) => (
                      <span key={g}>{g}{i < book.genres.length - 1 && <i>•</i>}</span>
                    ))}
                  </div>
                )}

                <h1 className="bp-title">{book.title}</h1>

                {(has(book.author) || book.verified) && (
                  <p className="bp-author">
                    {has(book.author) && `by ${book.author}`}
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
                )}

                {hasNum(book.rating) && (
                  <div className="bp-rating">
                    <Stars value={book.rating} />
                    <span>
                      {book.rating}
                      {hasNum(book.reviewCount) && ` (${book.reviewCount} Reviews)`}
                    </span>
                  </div>
                )}

                {hasList(book.pull) && (
                  <blockquote className="bp-pull">
                    <span className="bp-pull-mark">“</span>
                    <div>
                      {book.pull.map((line: any, i: number) => (
                        <p key={i}>{line}{i === book.pull.length - 1 && '”'}</p>
                      ))}
                    </div>
                  </blockquote>
                )}

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
            {hasList(book.videos) && (
              <section className="bp-videos">
                {book.videos.map((v: any) => (
                  <article className="bp-card bp-video" key={v.label}>
                    {has(v.label) && <h3>{v.label}</h3>}
                    {has(v.thumb) && (
                      <div className="bp-video-thumb">
                        <img src={v.thumb} alt="" loading="lazy" />
                        <span className="bp-play" aria-hidden="true">
                          <I.play width="26" height="26" fill="#fff" />
                        </span>
                      </div>
                    )}
                    {(has(v.caption) || has(v.duration)) && (
                      <footer>
                        {has(v.caption) && <span>{v.caption}</span>}
                        {has(v.duration) && <span>{v.duration}</span>}
                      </footer>
                    )}
                  </article>
                ))}
              </section>
            )}

            {/* about */}
            {showAbout && (
              <section className={`bp-card bp-about${has(book.aboutImage) ? '' : ' is-textonly'}`}>
                <div className="bp-about-copy">
                  <h2>About the Book</h2>
                  {has(book.about) && <p>{book.about}</p>}

                  {facts.length > 0 && (
                    <ul className="bp-meta" style={{ '--bp-meta-cols': facts.length } as React.CSSProperties}>
                      {facts.map((f) => {
                        const Ico = I[f.icon as keyof typeof I]
                        return (
                          <li key={f.label}>
                            <Ico width="21" height="21" fill="none" stroke="#c9962f" strokeWidth="1.5"
                              strokeLinecap="round" strokeLinejoin="round" />
                            <div><span>{f.label}</span><strong>{f.value}</strong></div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
                {has(book.aboutImage) && (
                  <figure className="bp-about-art">
                    <img src={book.aboutImage} alt="" loading="lazy" />
                  </figure>
                )}
              </section>
            )}

            {/* what makes it special */}
            {hasList(book.special) && (
              <section className="bp-special">
                <h2>What Makes It Special</h2>
                <div className="bp-special-grid">
                  {book.special.map((s: any) => {
                    const Ico = I[s.icon as keyof typeof I] || I.spark
                    return (
                      <article className="bp-card bp-special-card" key={s.title}>
                        <Ico width="24" height="24" fill="none" stroke="#c9962f" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                        {has(s.title) && <h4>{s.title}</h4>}
                        {has(s.text) && <p>{s.text}</p>}
                      </article>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ============ side column ============ */}
          <div className="bp-col bp-col-aside">
            {/* availability */}
            {hasList(book.retailers) && (
              <section className="bp-card bp-avail">
                <h3>Book Availability</h3>
                <ul>
                  {book.retailers.map((r: any) => (
                    <li key={r.name}>
                      {has(r.mark) && <span className="bp-retailer-mark" style={{ color: r.tone }}>{r.mark}</span>}
                      <span className="bp-retailer-name">{r.name}</span>
                      {/* No link, no button — rather than a control that goes nowhere. */}
                      {has(r.url) && <a className="bp-btn bp-btn-gold bp-btn-xs" href={r.url}>{r.cta}</a>}
                    </li>
                  ))}
                </ul>
                <a className="bp-all-retailers" href="#">
                  View all retailers
                  <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </a>
              </section>
            )}

            {/* summary */}
            {(hasList(book.summaryLines) || has(book.summaryBody)) && (
              <section className="bp-card bp-summary">
                <h3>Book Summary</h3>
                {book.summaryLines.map((l) => <p className="bp-summary-line" key={l}>{l}</p>)}
                {has(book.summaryBody) && <p className="bp-summary-body">{book.summaryBody}</p>}
                <a className="bp-all-retailers" href={summaryHref}>
                  Read More
                  <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </a>
              </section>
            )}

            {/* our review */}
            {showReviewCard && (
              <section className="bp-card bp-review">
                <h3>Book Review By Books Paradise</h3>
                {has(book.review.text) && (
                  <div className="bp-review-top">
                    <img className="bp-review-avatar" src="/assets/logo-girl.png" alt="" />
                    <p>{book.review.text}</p>
                  </div>
                )}

                {(hasNum(book.review.overall) || hasList(book.review.loved) || hasList(book.review.better)) && (
                  <div className="bp-verdict" style={{ '--bp-verdict-cols': verdictPanels } as React.CSSProperties}>
                    {hasNum(book.review.overall) && (
                      <div className="bp-verdict-score">
                        <span>OVERALL RATING</span>
                        <strong>{book.review.overall}<em> / 5</em></strong>
                        <Stars value={book.review.overall} size={17} />
                      </div>
                    )}
                    {hasList(book.review.loved) && (
                      <div className="bp-verdict-list">
                        <span>What We Loved</span>
                        {book.review.loved.map((x: any) => (
                          <p key={x}>
                            <I.check width="16" height="16" fill="none" stroke="#2f8f5b" strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round" />{x}
                          </p>
                        ))}
                      </div>
                    )}
                    {hasList(book.review.better) && (
                      <div className="bp-verdict-list">
                        <span>What Could Be Better</span>
                        {book.review.better.map((x: any) => (
                          <p key={x}>
                            <I.minus width="16" height="16" fill="none" stroke="#d05b4a" strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round" />{x}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <a className="bp-all-retailers" href={reviewHref}>
                  Read Full Review
                  <I.arrow width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </a>
              </section>
            )}

            {/* share */}
            <section className="bp-card bp-share">
              <h3>Share This Book</h3>
              <div className="bp-share-row">
                {SOCIALS.map((s: any) => (
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

        <BookQuote quote={quote} />
      </main>
    </div>
  )
}
