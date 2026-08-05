'use client'

export type Crumb = { label: string; href?: string }

type SvgProps = React.SVGProps<SVGSVGElement>

/* Shared chrome for every book page (detail / full review / full summary):
   the icon set, star rating, left sidebar, top bar and the quote banner.
   Keeping them here means a change to the shell updates all three pages. */


/* --- tiny inline icon set (stroke = currentColor, so they inherit) --- */
export const I = {
  home: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>),
  books: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 4h6v16H4z" /><path d="M10 6h5l3 14-5 1z" /></svg>),
  reviews: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>),
  trailers: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="m10 8.5 6 3.5-6 3.5z" /></svg>),
  community: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="9" cy="9" r="3" /><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" /><path d="M16 7a3 3 0 0 1 0 6" /><path d="M18 20c0-2.5-1-4-3-4.6" /></svg>),
  about: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg>),
  search: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>),
  bell: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M18 15V10a6 6 0 0 0-12 0v5l-2 3h16z" /><path d="M10 21h4" /></svg>),
  user: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>),
  heart: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z" /></svg>),
  arrow: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>),
  back: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M20 12H5M11 6l-6 6 6 6" /></svg>),
  pages: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /></svg>),
  calendar: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>),
  language: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" /></svg>),
  genre: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 5h16v14H4z" /><path d="M4 9h16" /></svg>),
  pen: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m14 6 4 4" /></svg>),
  spark: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M13 3 5 14h6l-2 7 8-11h-6z" /></svg>),
  twist: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M5 7h6a4 4 0 0 1 0 8H9" /><path d="m11 12-2 3 2 3" /><path d="M14 17h5" /></svg>),
  people: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" /></svg>),
  quill: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M20 4C10 6 6 11 5 20" /><path d="M20 4c0 8-5 12-11 12H5" /></svg>),
  shield: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></svg>),
  eye: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2.6" /></svg>),
  book: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M12 4v14" /></svg>),
  check: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>),
  minus: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 12h7" /></svg>),
  link: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="M10 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7L11 8" /><path d="M14 10a4 4 0 0 0-6-.5l-2 2A4 4 0 0 0 11.7 17L13 16" /></svg>),
  play: (p: SvgProps) => (<svg viewBox="0 0 24 24" {...p}><path d="m9 7 9 5-9 5z" /></svg>),
}

export const SOCIALS = [
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
export function Stars({ value, size = 22 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  const row = (cls: string) => (
    <span className={cls} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size}>
          <path d="M12 2.4l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.6l1.2-6.6L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  )
  return (
    <span className="bp-stars" style={{ '--pct': `${pct}%` } as React.CSSProperties} role="img" aria-label={`${value} out of 5 stars`}>
      {row('bp-stars-base')}
      {row('bp-stars-fill')}
    </span>
  )
}

export function BookSidebar() {
  return (
    <aside className="bp-side">
      <a className="bp-side-brand" href="/">Books Paradise</a>

      <a className="bp-side-badge" href="/" aria-label="Books Paradise home">
        <img src="/assets/logo.png" alt="" />
      </a>

      <nav className="bp-side-nav" aria-label="Primary">
        {NAV.map((n) => {
          const Ico = I[n.icon as keyof typeof I]
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
  )
}

/* `crumbs` is [{label, href}] — the last entry renders as the current page. */
export function BookTopBar({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <header className="bp-top">
      <nav className="bp-crumb" aria-label="Breadcrumb">
        {crumbs.map((c: Crumb, i: number) => (
          <span key={c.label} className="bp-crumb-item">
            {i > 0 && <span className="bp-crumb-sep">›</span>}
            {c.href ? <a href={c.href}>{c.label}</a> : <em>{c.label}</em>}
          </span>
        ))}
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
  )
}

export function BookQuote({ quote }: { quote: { text: string; author: string } }) {
  return (
    <section className="bp-quote">
      <div className="bp-quote-copy">
        <span aria-hidden="true">“</span>
        <div>
          <p>“{quote.text}”</p>
          <cite>– {quote.author}</cite>
        </div>
      </div>
      <img src="/assets/icon-curated.png" alt="" loading="lazy" />
    </section>
  )
}
