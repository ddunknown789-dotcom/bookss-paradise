import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SmoothScroll from '@/components/SmoothScroll'
import { graph, organizationSchema, websiteSchema } from '@/lib/seo/schema'
import { getSetting, getSocialLinks } from '@/lib/cms/queries'
import { SAME_AS } from '@/lib/site'

/**
 * Public-site layout.
 *
 * Exists as a route group so the footer and the site-wide entity graph apply
 * to every visitor-facing page while /admin, which shares the root layout,
 * gets neither. Group folders do not appear in URLs, so every route keeps the
 * address it already had.
 *
 * Organization and WebSite are emitted once here rather than per page: Google
 * only needs the entity described once per crawl, and repeating it on every
 * page is duplication that adds nothing. Individual pages add their own
 * WebPage and BreadcrumbList nodes, which reference these two by `@id`.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [email, logo, siteName, description, cmsSocials] = await Promise.all([
    getSetting<string>('contact.email', ''),
    getSetting<string>('site.logo', ''),
    getSetting<string>('site.name', ''),
    getSetting<string>('seo.defaultDescription', ''),
    getSocialLinks(),
  ])

  // Editor-managed social accounts take over from the defaults once set.
  const sameAs = cmsSocials.length ? cmsSocials.map((s) => s.url) : SAME_AS

  const siteGraph = graph(
    organizationSchema({
      email: email || undefined,
      // site.logo is a site-relative path; the schema needs an absolute URL
      logo: logo && !logo.startsWith('http') ? undefined : logo || undefined,
      sameAs,
    }),
    websiteSchema({ name: siteName || undefined, description: description || undefined }),
  )

  return (
    <>
      {/* Lenis + ScrollTrigger wiring. It belongs to the visitor-facing pages
          only — /admin shares the root layout and must keep native scrolling,
          or nothing inside a dialog will scroll. */}
      <SmoothScroll />
      <JsonLd id="site-graph" json={siteGraph} />
      {children}
      <SiteFooter />
    </>
  )
}
