import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import BookPage from '@/components/BookPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getBook, getBookSlugs, getPageQuote } from '@/lib/cms/queries'
import JsonLd from '@/components/JsonLd'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/schema'
import { NODE } from '@/lib/seo/schema'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getBookSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)
  if (!book) return {}
  return buildMetadata({
    entityType: 'book',
    entityId: book.id,
    path: `/books/${slug}`,
    fallback: {
      title: `${book.title} — ${book.author}`,
      description: book.summaryBody || book.about.slice(0, 160),
      image: book.coverSrc,
      type: 'article',
    },
  })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [book, quote] = await Promise.all([getBook(slug), getPageQuote()])
  if (!book) notFound()

  // Search engines get the real Book record, not just a page of text.
  const jsonLd = {
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.author },
    numberOfPages: book.pages || undefined,
    inLanguage: book.language,
    isbn: book.isbn || undefined,
    publisher: book.publisher || undefined,
    datePublished: book.publicationDate || undefined,
    image: book.coverSrc || undefined,
    description: book.about || undefined,
    aggregateRating: book.rating
      ? { '@type': 'AggregateRating', ratingValue: book.rating, reviewCount: book.reviewCount, bestRating: 5 }
      : undefined,
  }

  const pageGraph = graph(
    { ...jsonLd, '@context': undefined, publisher: { '@id': NODE.organization } },
    webPageSchema({
      path: `/books/${slug}`,
      name: `${book.title} — ${book.author}`,
      description: book.summaryBody || book.about.slice(0, 160),
      type: 'ItemPage',
      image: book.coverSrc || undefined,
      breadcrumbPath: `/books/${slug}`,
    }),
    breadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Books', path: '/books' },
        { name: book.title, path: `/books/${slug}` },
      ],
      `/books/${slug}`,
    ),
  )

  return (
    <>
      <JsonLd id="book-graph" json={pageGraph} />
      <BookPage book={book} quote={quote} related={book.related} />
    </>
  )
}
