import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import BookLongPage from '@/components/BookLongPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getBook, getPageQuote } from '@/lib/cms/queries'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)
  if (!book) return {}
  return buildMetadata({
    entityType: 'book',
    entityId: book.id,
    path: `/books/${slug}/summary`,
    fallback: {
      title: `summary of ${book.title}`,
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
  return <BookLongPage book={book} kind="summary" quote={quote} related={book.related} />
}
