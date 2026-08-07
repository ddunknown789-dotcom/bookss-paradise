import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import WeeksPage from '@/components/WeeksPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getWeeks } from '@/lib/cms/queries'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/schema'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    entityType: 'collection',
    fallback: { title: "Every Week's Book of the Week" },
    path: '/books-of-the-week',
  })
}

export default async function Page() {
  const weeks = await getWeeks()

  const pageGraph = graph(
    webPageSchema({
      path: '/books-of-the-week',
      name: "Every Week's Book of the Week",
      description: 'Handpicked stories that stay with you long after the last page.',
      type: 'CollectionPage',
      breadcrumbPath: '/books-of-the-week',
    }),
    breadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Book of the Week', path: '/books-of-the-week' },
      ],
      '/books-of-the-week',
    ),
  )

  return (
    <>
      <JsonLd id="weeks-graph" json={pageGraph} />
      <WeeksPage weeks={weeks} />
    </>
  )
}
