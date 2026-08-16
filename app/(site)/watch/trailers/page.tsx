import type { Metadata } from 'next'

import WatchRoute, { watchMetadata } from '@/components/WatchRoute'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return watchMetadata('trailer')
}

export default async function Page() {
  return <WatchRoute category="trailer" />
}
