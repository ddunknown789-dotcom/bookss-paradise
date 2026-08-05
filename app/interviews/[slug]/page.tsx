import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import InterviewPage from '@/components/InterviewPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getInterview, getInterviews } from '@/lib/cms/queries'

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
  return <InterviewPage item={item} />
}
