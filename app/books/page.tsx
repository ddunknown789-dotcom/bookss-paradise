import type { Metadata } from 'next'

import BooksCollection from '@/components/BooksCollection'
import { buildMetadata } from '@/lib/cms/metadata'
import { getBooks } from '@/lib/cms/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    entityType: 'collection',
    fallback: { title: 'All Books Collection', description: 'A dedicated shelf for every featured title.' },
    path: '/books',
  })
}

export default async function BooksPage() {
  const books = await getBooks(200)
  return <BooksCollection books={books} />
}
