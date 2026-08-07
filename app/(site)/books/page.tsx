import type { Metadata } from 'next'

import BooksCollection from '@/components/BooksCollection'
import JsonLd from '@/components/JsonLd'
import { buildMetadata } from '@/lib/cms/metadata'
import { getBooks } from '@/lib/cms/queries'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/schema'

export const revalidate = 3600

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const base = await buildMetadata({
    entityType: 'collection',
    fallback: {
      title: 'All Books Collection',
      description: 'Every title featured on Books Paradise — with a review, summary and trailer for each one.',
    },
    path: '/books',
  })

  // A search result is a thin, infinitely-variable page. It keeps the canonical
  // of the unfiltered collection and is left out of the index, which is what
  // Google asks for internal search results.
  if (q?.trim()) {
    return {
      ...base,
      title: `Search: ${q.trim()}`,
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    }
  }
  return base
}

export default async function BooksPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const books = await getBooks(200)

  // Backs the SearchAction declared in the WebSite schema — without this the
  // structured data would promise a search the site cannot perform. Filtering
  // happens here rather than in SQL so the cached book list is reused.
  const term = (q ?? '').trim().toLowerCase()
  const shown = term
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term) ||
          b.genre.toLowerCase().includes(term),
      )
    : books

  const pageGraph = graph(
    webPageSchema({
      path: '/books',
      name: 'All Books Collection',
      description: 'Every title featured on Books Paradise.',
      type: 'CollectionPage',
      breadcrumbPath: '/books',
    }),
    breadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Books', path: '/books' },
      ],
      '/books',
    ),
  )

  return (
    <>
      {/* not on a search result — that page is noindex and has no canonical identity */}
      {!term && <JsonLd id="books-graph" json={pageGraph} />}
      <BooksCollection books={shown} query={term ? (q ?? '') : undefined} />
    </>
  )
}
