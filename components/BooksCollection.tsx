'use client'

import type { BookCardView } from '@/lib/cms/types'

import { ArrowRight } from '@/components/ui'


export default function BooksCollection({
  books,
  query,
}: {
  books: BookCardView[]
  /** Set when the page was reached through the site search (?q=). */
  query?: string
}) {
  const BOOKS = books
  return (
    <main className="collection-page">
      <header className="collection-nav" aria-label="Books collection navigation">
        <a className="collection-brand" href="/" aria-label="Books Paradise home">
          <img src="/assets/logo.png" alt="" />
          <span>Books Paradise</span>
        </a>
        <a className="collection-back" href="/#books">
          Back Home <ArrowRight size={18} />
        </a>
      </header>

      <section className="collection-hero">
        <div>
          <p className="collection-kicker">{query ? 'Search Results' : 'Full Library'}</p>
          <h1>{query ? `Results for “${query}”` : 'All Books Collection'}</h1>
          {query ? (
            <p>
              {BOOKS.length} {BOOKS.length === 1 ? 'title matches' : 'titles match'} your search.{' '}
              <a href="/books">Show every book</a>
            </p>
          ) : (
            <p>
              A dedicated shelf for every featured title. We can expand this into
              filters, categories, search, book details, and review pages next.
            </p>
          )}
        </div>
      </section>

      <section className="collection-grid" aria-label="All books">
        {BOOKS.map((book) => (
          <a className="collection-book" key={book.slug} href={book.href}>
            <div className="collection-cover">
              <img src={book.coverSrc} alt={`${book.title} by ${book.author}`} />
            </div>
            <div className="collection-meta">
              <span>{book.genre}</span>
              <h2>{book.title}</h2>
              <p>{book.author}</p>
            </div>
          </a>
        ))}
      </section>
    </main>
  )
}
