'use client'

type SvgProps = React.SVGProps<SVGSVGElement>

import type { InterviewView } from '@/lib/cms/types'

import { useEffect, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import { Divider } from '@/components/ui'
import { goBack } from '@/lib/router'
import { has, hasList } from '@/lib/cms/optional'
import '@/styles/interview.css'

const Icon = {
  back: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M19 12H6M11 6l-6 6 6 6" /></svg>),
  bookmark: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21z" /></svg>),
  share: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" /><path d="m8.3 10.7 7.4-4.4M8.3 13.3l7.4 4.4" /></svg>),
  clock: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v4.65l3.1 1.85" /></svg>),
  calendar: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>),
  chevron: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="m6 9 6 6 6-6" /></svg>),
}

export default function InterviewPage({ item }: { item: InterviewView }) {
  // All questions start open, matching the reference; each can still be
  // collapsed individually.
  const [openSet, setOpenSet] = useState(() => new Set(item.qa.map((_, i) => i)))
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const prev = document.title
    document.title = `${item.title} | Books Paradise`
    return () => { document.title = prev }
  }, [item.title])

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const share = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800) }
    if (navigator.share) {
      navigator.share({ title: item.title, url: window.location.href }).catch(() => {})
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).then(done).catch(done)
    } else done()
  }

  return (
    <div className="iv">
      <SiteHeader />

      <main className="iv-main">
        <div className="iv-topbar">
          <a
            className="iv-back"
            href="/#interviews"
            onClick={(e) => { e.preventDefault(); goBack('/#interviews') }}
          >
            <Icon.back width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
            Back to All Interviews
          </a>
          <div className="iv-actions">
            <button
              type="button"
              className={saved ? 'is-on' : ''}
              aria-pressed={saved}
              aria-label={saved ? 'Remove bookmark' : 'Bookmark this interview'}
              onClick={() => setSaved((v) => !v)}
            >
              <Icon.bookmark width="17" height="17" fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </button>
            <button type="button" aria-label="Share this interview" onClick={share}>
              <Icon.share width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
            </button>
          </div>
        </div>
        {copied && <p className="iv-copied" role="status">Link copied</p>}

        <div className="iv-grid">
          {/* ---- profile ---- */}
          <aside className="iv-profile">
            {has(item.image) && (
              <figure className="iv-photo">
                <img src={item.image} alt={item.author} />
              </figure>
            )}
            {has(item.author) && <h2 className="iv-name">{item.author}</h2>}
            {has(item.bookTitle) && (
              <p className="iv-role">
                Author of <a href={item.bookSlug ? `/books/${item.bookSlug}` : '/books'}>{item.bookTitle}</a>
              </p>
            )}
            {(has(item.minutes) || has(item.date)) && (
              <div className="iv-meta">
                {has(item.minutes) && (
                  <span>
                    <Icon.clock width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7"
                      strokeLinecap="round" strokeLinejoin="round" />
                    {item.minutes}
                  </span>
                )}
                {/* The dot is a separator, so it only earns its place between two things. */}
                {has(item.minutes) && has(item.date) && <i className="iv-meta-dot" aria-hidden="true" />}
                {has(item.date) && (
                  <span>
                    <Icon.calendar width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7"
                      strokeLinecap="round" strokeLinejoin="round" />
                    <time dateTime={item.iso ?? undefined}>{item.date}</time>
                  </span>
                )}
              </div>
            )}
          </aside>

          {/* ---- interview body ---- */}
          <div className="iv-content">
            <h1 className="iv-title">{item.title}</h1>
            {has(item.intro) && <p className="iv-lede">{item.intro}</p>}
            <Divider align="left" width={220} />

            {hasList(item.qa) && (
            <div className="iv-qa-list">
              {item.qa.map((pair, i) => {
                const open = openSet.has(i)
                return (
                  <article className={`iv-qa${open ? ' is-open' : ''}`} key={pair.q}>
                    <button
                      type="button"
                      className="iv-qa-q"
                      onClick={() => toggle(i)}
                      aria-expanded={open}
                    >
                      <span className="iv-avatar iv-avatar-q" aria-hidden="true">Q</span>
                      <h3>{pair.q}</h3>
                      <Icon.chevron className="iv-chevron" width="19" height="19" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </button>
                    {open && has(pair.a) && (
                      <div className="iv-qa-a">
                        <span className="iv-avatar iv-avatar-a" aria-hidden="true">A</span>
                        <p>{pair.a}</p>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
