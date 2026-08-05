import type { Metadata } from 'next'

import WeeksPage from '@/components/WeeksPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getWeeks } from '@/lib/cms/queries'

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
  return <WeeksPage weeks={weeks} />
}
