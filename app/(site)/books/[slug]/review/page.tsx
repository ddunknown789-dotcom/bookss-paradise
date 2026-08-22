import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import BookLongPage from '@/components/BookLongPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getBook, getPageQuote } from '@/lib/cms/queries'
import JsonLd from '@/components/JsonLd'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/schema'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)
  if (!book) return {}
  return buildMetadata({
    entityType: 'book',
    entityId: book.id,
    path: `/books/${slug}/review`,
    fallback: {
      title: `Review: ${book.title}`,
      description: book.review.text || book.summaryBody,
      image: book.coverSrc,
      type: 'article',
    },
  })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [book, quote] = await Promise.all([getBook(slug), getPageQuote()])
  if (!book) notFound()

  const path = `/books/${slug}/review`
  const pageGraph = graph(
    webPageSchema({
      path,
      name: `Review: ${book.title}`,
      description: book.author ? `Our full review of ${book.title} by ${book.author}.` : `Our full review of ${book.title}.`,
      type: 'ItemPage',
      image: book.coverSrc || undefined,
      breadcrumbPath: path,
    }),
    breadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Books', path: '/books' },
        { name: book.title, path: `/books/${slug}` },
        { name: 'Review', path },
      ],
      path,
    ),
  )

  return (
    <>
      <JsonLd id="review-graph" json={pageGraph} />
      <BookLongPage book={book} kind="review" quote={quote} related={book.related} />
    </>
  )
}
