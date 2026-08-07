import { ORG } from '@/lib/site'
import { getSetting, getSocialLinks } from '@/lib/cms/queries'
import '@/styles/footer.css'

/* ============================================================================
   Site footer.

   A server component so its links are in the initial HTML — footer links are
   a real part of how a crawler discovers a site, and one rendered only after
   hydration is worth much less.

   Content comes from the CMS where an editor should control it (blurb,
   copyright, social accounts) and falls back to lib/site.ts otherwise, so the
   footer is never blank on a fresh install.
   ========================================================================== */

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Books', href: '/books' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'Interviews', href: '/#interviews' },
  { label: 'Services', href: '/#offer' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/about#contact' },
]

const LEGAL = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
]

const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14.5 8.5h2.2V5.2h-2.6c-2.8 0-4.4 1.7-4.4 4.6v2.1H7.2v3.4h2.5V22h3.6v-6.7h2.6l.5-3.4h-3.1V9.9c0-1 .4-1.4 1.2-1.4z" />,
  twitter: <path d="M4 3.5h4.2l4.1 5.6L17.2 3.5H21l-6.6 7.6L21.4 20.5h-4.2l-4.4-6-5.2 6H4l7-8.1z" />,
  x: <path d="M4 3.5h4.2l4.1 5.6L17.2 3.5H21l-6.6 7.6L21.4 20.5h-4.2l-4.4-6-5.2 6H4l7-8.1z" />,
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.4v5.2l4.6-2.6z" fill="currentColor" stroke="none" />
    </>
  ),
}

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.8 6.5 8.2 6 8.2-6" />
  </svg>
)

export default async function SiteFooter() {
  const [blurb, copyrightTemplate, logo, siteName, cmsSocials] = await Promise.all([
    getSetting<string>('footer.blurb', ORG.description),
    getSetting<string>('footer.copyright', `© {year} ${ORG.name}. All Rights Reserved.`),
    getSetting<string>('site.logo', '/assets/logo.png'),
    getSetting<string>('site.name', ORG.name),
    getSocialLinks(),
  ])

  // The CMS list wins when an editor has filled it in; otherwise fall back to
  // the three accounts the brand actually has.
  const socials = cmsSocials.length
    ? cmsSocials.map((s) => ({ platform: s.platform.toLowerCase(), label: s.label, url: s.url }))
    : [
        { platform: 'instagram', label: 'Instagram', url: ORG.social.instagram.url },
        { platform: 'facebook', label: 'Facebook', url: ORG.social.facebook.url },
        { platform: 'twitter', label: 'X (Twitter)', url: ORG.social.twitter.url },
      ]

  const copyright = copyrightTemplate.replace('{year}', String(new Date().getFullYear()))

  return (
    <footer className="ft" role="contentinfo">
      <div className="ft-inner">
        {/* ------------------------------ brand ---------------------------- */}
        <div className="ft-brand">
          <a className="ft-logo" href="/" aria-label={`${siteName} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={46} height={46} loading="lazy" />
            <span className="ft-logo-text">
              <b>{siteName}</b>
              <span>{ORG.type}</span>
            </span>
          </a>
          <p className="ft-blurb">{blurb}</p>
          <a className="ft-contact" href={`mailto:${ORG.email}`}>
            <MailIcon />
            {ORG.email}
          </a>
        </div>

        {/* --------------------------- navigation -------------------------- */}
        <nav aria-labelledby="ft-nav-title">
          <h2 className="ft-col-title" id="ft-nav-title">Explore</h2>
          <ul className="ft-nav">
            {NAV.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ----------------------------- social ---------------------------- */}
        <div>
          <h2 className="ft-col-title" id="ft-social-title">Follow</h2>
          <div className="ft-social" role="list" aria-labelledby="ft-social-title">
            {socials.map((s) => (
              <a
                key={s.platform + s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={s.label || s.platform}
                role="listitem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[s.platform] ?? ICONS.instagram}
                </svg>
              </a>
            ))}
          </div>
          <p className="ft-handle">
            <b>{ORG.social.instagram.handle}</b> on Instagram
          </p>
        </div>
      </div>

      {/* ---------------------------- bottom bar --------------------------- */}
      <div className="ft-bottom">
        <p className="ft-copy">{copyright}</p>
        <nav className="ft-legal" aria-label="Legal">
          {LEGAL.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
