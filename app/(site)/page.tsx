import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import HomeShell from '@/components/HomeShell'
import SectionRenderer from '@/components/SectionRenderer'
import { buildMetadata } from '@/lib/cms/metadata'
import {
  getBooks,
  getBooksWithReviews,
  getCurrentWeek,
  getInterviews,
  getMenu,
  getPageSections,
  getServices,
  getSettings,
  getVideos,
} from '@/lib/cms/queries'
import type { SectionContentMap } from '@/lib/cms/sections'
import { graph, webPageSchema } from '@/lib/seo/schema'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ entityType: 'page', fallback: {}, path: '/' })
}

export default async function HomePage() {
  const sections = await getPageSections('home')

  // Fetch only what the visible sections actually need. Hiding a section in
  // the admin therefore also stops its query — no wasted round trips.
  const wants = new Set(sections.map((s) => s.type))
  const limitOf = <T extends keyof SectionContentMap>(type: T, fallback: number): number => {
    const s = sections.find((x) => x.type === type)
    const c = s?.content as { limit?: number } | undefined
    return c?.limit ?? fallback
  }

  const [menu, settings, books, reviewBooks, videos, week, interviews, services] = await Promise.all([
    getMenu('primary'),
    getSettings(),
    wants.has('top_picks') ? getBooks(limitOf('top_picks', 12)) : Promise.resolve([]),
    wants.has('reviews') ? getBooksWithReviews(limitOf('reviews', 6)) : Promise.resolve([]),
    wants.has('videos') ? getVideos() : Promise.resolve([]),
    wants.has('book_of_week') ? getCurrentWeek() : Promise.resolve(null),
    wants.has('interviews') ? getInterviews(limitOf('interviews', 4)) : Promise.resolve([]),
    wants.has('offer') ? getServices() : Promise.resolve([]),
  ])

  const showIntro = wants.has('intro')

  // Organization + WebSite live in the (site) layout; the home page adds only
  // its own WebPage node, which references them by @id.
  const pageGraph = graph(
    webPageSchema({
      path: '/',
      name: 'Books Paradise — Literary Marketing Agency & Book Review Platform',
      description:
        'Handpicked books, cinematic trailers, honest reviews, and a community that lives for stories.',
    }),
  )

  return (
    <>
    <JsonLd id="home-graph" json={pageGraph} />
    <HomeShell
      menu={menu}
      settings={settings}
      showIntro={showIntro}
      introContent={sections.find((s) => s.type === 'intro')?.content as SectionContentMap['intro'] | undefined}
    >
      <SectionRenderer
        sections={sections}
        data={{ books, reviewBooks, videos, week, interviews, services }}
      />
    </HomeShell>
    </>
  )
}
