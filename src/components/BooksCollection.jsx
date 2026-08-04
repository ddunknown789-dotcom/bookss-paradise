import { ArrowRight } from './ui'
import { BOOKS, bookHref } from '../data/books'


export default function BooksCollection() {
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
          <p className="collection-kicker">Full Library</p>
          <h1>All Books Collection</h1>
          <p>
            A dedicated shelf for every featured title. We can expand this into
            filters, categories, search, book details, and review pages next.
          </p>
        </div>
      </section>

      <section className="collection-grid" aria-label="All books">
        {BOOKS.map((book) => (
          <a className="collection-book" key={book.slug} href={bookHref(book)}>
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
