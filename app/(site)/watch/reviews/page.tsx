import type { Metadata } from 'next'

import WatchRoute, { watchMetadata } from '@/components/WatchRoute'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return watchMetadata('review')
}

export default async function Page() {
  return <WatchRoute category="review" />
}
