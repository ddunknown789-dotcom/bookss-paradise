/**
 * JSON-LD builders.
 *
 * Everything Google reads about this site as an *entity* is produced here.
 * Three rules the code follows, because breaking any of them quietly costs
 * you the rich result:
 *
 *  1. `@id` is a stable URL, not a random string. It is how separate blocks on
 *     separate pages are understood to describe the same organisation.
 *  2. Nothing is asserted that the page does not also show a human. Google
 *     cross-checks structured data against visible content.
 *  3. No property is emitted empty. An empty string is a broken claim; an
 *     absent property is simply unknown.
 */

import { ORG, SAME_AS, SITE_URL, absoluteUrl } from '@/lib/site'

/** Stable node identifiers — the backbone of a linked graph. */
export const NODE = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  logo: `${SITE_URL}/#logo`,
  page: (path: string) => `${absoluteUrl(path)}#webpage`,
  breadcrumb: (path: string) => `${absoluteUrl(path)}#breadcrumb`,
} as const

type Json = Record<string, unknown>

/** Drop keys that are null/undefined/empty so no hollow claims are published. */
function clean<T extends Json>(obj: T): T {
  const out: Json = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue
    if (typeof v === 'string' && !v.trim()) continue
    if (Array.isArray(v) && !v.length) continue
    out[k] = v
  }
  return out as T
}

/* -------------------------------------------------------------------------- */
/* Organization                                                                */
/* -------------------------------------------------------------------------- */

export function organizationSchema(opts: { email?: string; logo?: string; sameAs?: string[] } = {}): Json {
  const logo = opts.logo ?? ORG.logo

  return clean({
    '@type': 'Organization',
    '@id': NODE.organization,
    name: ORG.name,
    alternateName: ORG.alternateName,
    legalName: ORG.legalName,
    url: SITE_URL,
    description: ORG.shortDescription,
    slogan: ORG.tagline,
    foundingDate: ORG.foundingDate,
    email: opts.email || ORG.email,

    // An ImageObject with dimensions is what Google wants for a logo; a bare
    // URL string is accepted but gives it less to work with.
    logo: clean({
      '@type': 'ImageObject',
      '@id': NODE.logo,
      url: logo,
      contentUrl: logo,
      width: ORG.logoWidth,
      height: ORG.logoHeight,
      caption: ORG.name,
    }),
    image: { '@id': NODE.logo },

    sameAs: opts.sameAs ?? SAME_AS,

    contactPoint: [
      clean({
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: opts.email || ORG.email,
        url: `${SITE_URL}/about`,
        availableLanguage: ['English'],
        areaServed: 'Worldwide',
      }),
    ],

    // What this organisation is about, which helps disambiguate the entity.
    knowsAbout: [
      'Book Reviews',
      'Book Marketing',
      'Book Trailers',
      'Author Interviews',
      'Literary Promotion',
      'Publishing',
    ],

    areaServed: { '@type': 'Place', name: 'Worldwide' },

    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Author Services',
      itemListElement: ORG.services.map((service, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: { '@type': 'Service', name: service, provider: { '@id': NODE.organization } },
      })),
    },
  })
}

/* -------------------------------------------------------------------------- */
/* WebSite + SearchAction                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `potentialAction` is only included because /books genuinely honours `?q=`.
 * Declaring a SearchAction a site cannot perform is a broken promise Google
 * checks — so if that filter is ever removed, remove this too.
 */
export function websiteSchema(opts: { name?: string; description?: string } = {}): Json {
  return clean({
    '@type': 'WebSite',
    '@id': NODE.website,
    url: SITE_URL,
    name: opts.name || ORG.name,
    alternateName: ORG.alternateName,
    description: opts.description || ORG.shortDescription,
    inLanguage: 'en',
    publisher: { '@id': NODE.organization },
    copyrightHolder: { '@id': NODE.organization },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/books?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  })
}

/* -------------------------------------------------------------------------- */
/* WebPage                                                                     */
/* -------------------------------------------------------------------------- */

export function webPageSchema(opts: {
  path: string
  name: string
  description?: string
  type?: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ItemPage' | 'ContactPage'
  image?: string
  datePublished?: string
  dateModified?: string
  breadcrumbPath?: string
}): Json {
  const url = absoluteUrl(opts.path)
  return clean({
    '@type': opts.type ?? 'WebPage',
    '@id': NODE.page(opts.path),
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': NODE.website },
    about: { '@id': NODE.organization },
    inLanguage: 'en',
    primaryImageOfPage: opts.image ? { '@type': 'ImageObject', url: opts.image } : undefined,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    breadcrumb: opts.breadcrumbPath ? { '@id': NODE.breadcrumb(opts.breadcrumbPath) } : undefined,
  })
}

/* -------------------------------------------------------------------------- */
/* Breadcrumbs                                                                 */
/* -------------------------------------------------------------------------- */

export type Crumb = { name: string; path: string }

export function breadcrumbSchema(crumbs: Crumb[], forPath?: string): Json {
  return {
    '@type': 'BreadcrumbList',
    '@id': NODE.breadcrumb(forPath ?? crumbs[crumbs.length - 1]?.path ?? '/'),
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

/* -------------------------------------------------------------------------- */
/* Graph assembly                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Wraps nodes in a single `@graph`. One script tag per page rather than four
 * separate ones: nodes can then reference each other by `@id`, and Google
 * treats the whole thing as one connected description instead of four
 * unrelated fragments.
 */
export function graph(...nodes: (Json | null | undefined)[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  })
}
