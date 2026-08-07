import 'server-only'

import type { Metadata } from 'next'

import { getSeo, getSettings } from './queries'
import { canonicalOrigin } from '@/lib/site'

type BuildArgs = {
  entityType: 'global' | 'page' | 'book' | 'author' | 'interview' | 'collection'
  entityId?: string | null
  /** Used when the entity has no SEO row of its own yet. */
  fallback?: {
    title?: string
    description?: string
    image?: string
    type?: string
    publishedTime?: string
  }
  path?: string
}

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback)

/**
 * One place that turns CMS rows into Next metadata, so every page's title,
 * description, canonical, Open Graph and Twitter card come from the same
 * precedence chain:
 *
 *   per-entity SEO row  →  the entity's own fields  →  global SEO  →  settings
 */
export async function buildMetadata({ entityType, entityId, fallback = {}, path }: BuildArgs): Promise<Metadata> {
  const [settings, globalSeo, seo] = await Promise.all([
    getSettings(),
    getSeo('global', null),
    entityType === 'global' ? Promise.resolve(null) : getSeo(entityType, entityId ?? null),
  ])

  const siteName = str(settings['site.name'], 'Books Paradise')

  // Never a deployment domain — see canonicalOrigin() for why that matters.
  const siteUrl = canonicalOrigin(str(settings['site.url']))
  const template = str(settings['seo.titleTemplate'], '%s | Books Paradise')
  const indexingOn = bool(settings['seo.indexingEnabled'], true)

  const title =
    seo?.title || fallback.title || globalSeo.title || str(settings['seo.defaultTitle'], siteName)

  const description =
    seo?.description ||
    fallback.description ||
    globalSeo.description ||
    str(settings['seo.defaultDescription'])

  const image = seo?.ogImage || fallback.image || globalSeo.ogImage || null
  const canonical = seo?.canonical || (path && siteUrl ? `${siteUrl}${path}` : undefined)

  const noindex = !indexingOn || seo?.noindex || (entityType === 'global' && globalSeo.noindex)
  const nofollow = seo?.nofollow ?? globalSeo.nofollow

  const absolute = (src: string) => (src.startsWith('http') ? src : siteUrl ? `${siteUrl}${src}` : src)

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    // A page whose title already contains the site name must opt out of the
    // "%s | Books Paradise" template, or it renders as
    // "… Books Paradise | Books Paradise".
    title:
      entityType === 'global'
        ? { default: title, template }
        : title.toLowerCase().includes(siteName.toLowerCase())
          ? { absolute: title }
          : title,
    description: description || undefined,
    keywords: seo?.keywords?.length ? seo.keywords : globalSeo.keywords.length ? globalSeo.keywords : undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: { index: !noindex, follow: !nofollow },
    },
    openGraph: {
      title: seo?.ogTitle || fallback.title || title,
      description: seo?.ogDescription || description || undefined,
      siteName,
      type: (seo?.ogType || fallback.type || 'website') as 'website',
      url: canonical,
      images: image ? [{ url: absolute(image) }] : undefined,
      // only meaningful on article-type pages; Next types it per og type
      ...(fallback.publishedTime ? { publishedTime: fallback.publishedTime } : {}),
    } as Metadata['openGraph'],
    twitter: {
      card: (seo?.twitterCard || globalSeo.twitterCard || 'summary_large_image') as 'summary_large_image',
      title: seo?.ogTitle || fallback.title || title,
      description: seo?.ogDescription || description || undefined,
      site: seo?.twitterSite || globalSeo.twitterSite || undefined,
      creator: seo?.twitterCreator || globalSeo.twitterCreator || undefined,
      images: image ? [absolute(image)] : undefined,
    },
    // app/icon.png + app/apple-icon.png are picked up by Next's file
    // convention and emit their own tags. Only override when an editor has
    // pointed the setting somewhere else, or the page gets two icon links.
    icons:
      str(settings['site.favicon']) && str(settings['site.favicon']) !== '/icon.png'
        ? { icon: str(settings['site.favicon']) }
        : undefined,
  }
}

/** JSON-LD for a page, merged from the CMS structured_data field. */
export async function structuredData(
  entityType: BuildArgs['entityType'],
  entityId: string | null,
  fallback: Record<string, unknown> | null,
): Promise<string | null> {
  const seo = await getSeo(entityType, entityId)
  const data = seo.structuredData ?? fallback
  return data ? JSON.stringify(data) : null
}
