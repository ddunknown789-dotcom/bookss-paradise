import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import InterviewPage from '@/components/InterviewPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getInterview, getInterviews } from '@/lib/cms/queries'
import JsonLd from '@/components/JsonLd'
import { NODE, breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/schema'

export const revalidate = 3600

export async function generateStaticParams() {
  const list = await getInterviews(100)
  return list.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = await getInterview(slug)
  if (!item) return {}
  return buildMetadata({
    entityType: 'interview',
    entityId: item.id,
    path: `/interviews/${slug}`,
    fallback: { title: item.title, description: item.intro, image: item.image, type: 'article' },
  })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getInterview(slug)
  if (!item) notFound()

  const pageGraph = graph(
    {
      '@type': 'Article',
      headline: item.title,
      description: item.intro || undefined,
      image: item.image || undefined,
      datePublished: item.iso || undefined,
      author: item.author ? { '@type': 'Person', name: item.author } : undefined,
      publisher: { '@id': NODE.organization },
      isPartOf: { '@id': NODE.website },
      mainEntityOfPage: { '@id': `${NODE.page(`/interviews/${slug}`)}` },
      about: item.bookTitle ? { '@type': 'Book', name: item.bookTitle } : undefined,
    },
    webPageSchema({
      path: `/interviews/${slug}`,
      name: item.title,
      description: item.intro || undefined,
      type: 'ItemPage',
      image: item.image || undefined,
      datePublished: item.iso || undefined,
      breadcrumbPath: `/interviews/${slug}`,
    }),
    breadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Interviews', path: '/#interviews' },
        { name: item.title, path: `/interviews/${slug}` },
      ],
      `/interviews/${slug}`,
    ),
  )

  return (
    <>
      <JsonLd id="interview-graph" json={pageGraph} />
      <InterviewPage item={item} />
    </>
  )
}
