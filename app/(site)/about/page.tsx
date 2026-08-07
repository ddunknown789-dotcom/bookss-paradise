import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import SiteHeader from '@/components/SiteHeader'
import { Divider } from '@/components/ui'
import { buildMetadata } from '@/lib/cms/metadata'
import { getSetting } from '@/lib/cms/queries'
import { ORG } from '@/lib/site'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/schema'
import '@/styles/about.css'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    entityType: 'page',
    path: '/about',
    fallback: {
      title: `About ${ORG.name} — ${ORG.type}`,
      description: ORG.shortDescription,
      image: ORG.logo,
    },
  })
}

const MILESTONES = [
  { year: ORG.foundingDate, label: 'Founded', text: 'Started as a reading community and grew into a full literary marketing practice.' },
  { year: '12+', label: 'Titles featured', text: 'Every book on the shelf is read, reviewed and presented by a real person.' },
  { year: '100%', label: 'Honest reviews', text: 'A promotion package buys attention, never a rating. What a reviewer thinks stays theirs.' },
]

export default async function AboutPage() {
  const email = (await getSetting<string>('contact.email', '')) || ORG.email

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]

  // Organization and WebSite come from the (site) layout, which wraps this
  // page — repeating them here would just duplicate bytes on every crawl.
  const pageGraph = graph(
    webPageSchema({
      path: '/about',
      name: `About ${ORG.name}`,
      description: ORG.shortDescription,
      type: 'AboutPage',
      image: ORG.logo,
      breadcrumbPath: '/about',
    }),
    breadcrumbSchema(crumbs, '/about'),
  )

  return (
    <>
      <JsonLd id="about-graph" json={pageGraph} />
      <SiteHeader />

      <main className="ab">
        {/* ------------------------------ hero ---------------------------- */}
        <header className="ab-hero">
          <p className="ab-kicker">About Us</p>
          <h1 className="ab-title">{ORG.name}</h1>
          <Divider align="center" width={360} />
          <p className="ab-type">{ORG.type}</p>
          <p className="ab-lede">{ORG.description}</p>
        </header>

        {/* ----------------------------- story ---------------------------- */}
        <section className="ab-section" aria-labelledby="ab-story">
          <div className="ab-wrap">
            <h2 className="ab-h2" id="ab-story">Who we are</h2>
            <div className="ab-prose">
              <p>
                <strong>{ORG.name}</strong> is a {ORG.type.toLowerCase()} founded in{' '}
                <time dateTime={ORG.foundingDate}>{ORG.foundingDate}</time>. We sit between authors and
                readers: writers who need their book to be found, and readers who want to be told the truth
                about what they are about to spend a weekend with.
              </p>
              <p>
                We started as a reading community, and that is still the part that matters. Everything we
                offer authors — reviews, trailers, interviews, campaigns — only works because there are real
                readers on the other end of it who trust what we publish.
              </p>
              <p>
                That trust is the whole business, so we protect it in the plainest way available: a promotion
                package buys a reviewer’s time and attention, never a particular rating. What they think of
                the book stays entirely theirs.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------- milestones ------------------------- */}
        <section className="ab-section ab-section-tint" aria-labelledby="ab-facts">
          <div className="ab-wrap">
            <h2 className="ab-h2" id="ab-facts">At a glance</h2>
            <div className="ab-stats">
              {MILESTONES.map((m) => (
                <article className="ab-stat" key={m.label}>
                  <b>{m.year}</b>
                  <h3>{m.label}</h3>
                  <p>{m.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- services -------------------------- */}
        <section className="ab-section" aria-labelledby="ab-services">
          <div className="ab-wrap">
            <h2 className="ab-h2" id="ab-services">What we do</h2>
            <p className="ab-sub">
              Everything an author needs to put a finished book in front of the people who will actually read it.
            </p>
            <ul className="ab-services">
              {ORG.services.map((service) => (
                <li key={service}>
                  <span aria-hidden="true" />
                  {service}
                </li>
              ))}
            </ul>
            <p className="ab-more">
              The full breakdown lives on the <a href="/#offer">services section</a> of the home page.
            </p>
          </div>
        </section>

        {/* ---------------------------- contact --------------------------- */}
        <section className="ab-section ab-section-tint" id="contact" aria-labelledby="ab-contact">
          <div className="ab-wrap">
            <h2 className="ab-h2" id="ab-contact">Get in touch</h2>
            <p className="ab-sub">
              Whether you have written a book or just finished one, we would like to hear from you.
            </p>

            <address className="ab-contact">
              <article className="ab-contact-card">
                <h3>Email</h3>
                <a href={`mailto:${email}`}>{email}</a>
                <p>Author enquiries, review requests and everything else.</p>
              </article>

              <article className="ab-contact-card">
                <h3>Instagram</h3>
                <a
                  href={ORG.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                >
                  {ORG.social.instagram.handle}
                </a>
                <p>Daily features, trailers and what we are reading this week.</p>
              </article>
            </address>

            <p className="ab-more">
              Prefer a form? The <a href="/#newsletter">Join Us</a> section takes your email and we will come
              back to you.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
