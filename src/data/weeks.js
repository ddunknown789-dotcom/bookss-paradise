/* ============================================================================
   BOOK OF THE WEEK — single source of truth for every weekly selection.

   TO EDIT A WEEK: find it below and change the values. Both the homepage
   "Book of the Week" section and the /books-of-the-week archive read from
   here, so nothing else needs to change.

   TO ADD A NEW WEEK: paste a new entry at the TOP of the array. The first
   entry is always treated as the current week (it's what the homepage
   shows); everything after it becomes the archive, in order. The `label`
   is free text, so relabel older weeks ("Last Week" -> "Two Weeks Ago")
   however you like — nothing derives from it.

   TO REMOVE A WEEK: delete its entry. The layouts are driven by the data,
   so a week with 3 or 5 books lays out just as well as one with 4.

   Per book:
     title, author, genre, pages   — shown in both layouts
     published                     — shown on the homepage caption only
     cover                         — file in /public/assets (no extension)
     slug                          — OPTIONAL. When it matches a book in
                                     books.js the cover links to that book's
                                     page; without it the card is static.

   NOTE: cover art is reused from the existing five cover files as
   placeholder art. Drop real covers into /public/assets and point `cover`
   at them to replace — no layout changes needed.
   ========================================================================== */

export const WEEKS = [
  {
    id: 'this-week',
    label: 'This Week',
    range: 'Apr 28 – May 04, 2024',
    books: [
      {
        title: 'The Silent Page',
        author: 'Lucas Elliot',
        genre: 'Literary Fiction',
        pages: 320,
        published: 'May 12, 2024',
        cover: 'book-1',
        slug: 'the-silent-page',
      },
      {
        title: 'The Beyond the Horizon',
        author: 'Nora Elston',
        genre: 'Historical Fiction',
        pages: 384,
        published: 'Apr 28, 2024',
        cover: 'book-2',
        slug: 'beyond-the-horizon',
      },
      {
        title: 'The Lost Letters',
        author: 'Madilyn Hart',
        genre: 'Mystery',
        pages: 296,
        published: 'Apr 15, 2024',
        cover: 'book-3',
        slug: 'the-lost-letters',
      },
      {
        title: 'The Whispers of the Past',
        author: 'Clara Bennett',
        genre: 'Historical Fiction',
        pages: 352,
        published: 'Mar 30, 2024',
        cover: 'book-4',
        slug: 'whispers-of-the-past',
      },
    ],
  },
  {
    id: 'last-week',
    label: 'Last Week',
    range: 'Apr 21 – Apr 27, 2024',
    books: [
      {
        title: 'Shadows of Time',
        author: 'Ethan Grey',
        genre: 'Sci-Fi Thriller',
        pages: 412,
        published: 'Apr 21, 2024',
        cover: 'book-1',
      },
      {
        title: 'The Forgotten Meadow',
        author: 'Eliza Morgan',
        genre: 'Contemporary Fiction',
        pages: 336,
        published: 'Apr 22, 2024',
        cover: 'book-3',
      },
      {
        title: 'Light Between Worlds',
        author: 'Anna Shah',
        genre: 'Fantasy',
        pages: 368,
        published: 'Apr 24, 2024',
        cover: 'book-5',
        slug: 'the-light-between-worlds',
      },
      {
        title: 'Beneath the Surface',
        author: 'Daniel Reeves',
        genre: 'Thriller',
        pages: 344,
        published: 'Apr 26, 2024',
        cover: 'book-4',
      },
    ],
  },
  {
    id: 'two-weeks-ago',
    label: 'Two Weeks Ago',
    range: 'Apr 14 – Apr 20, 2024',
    books: [
      {
        title: 'The Golden Thread',
        author: 'Isabella Rose',
        genre: 'Historical Fiction',
        pages: 328,
        published: 'Apr 14, 2024',
        cover: 'book-3',
      },
      {
        title: 'Echoes of Yesterday',
        author: 'James Whitaker',
        genre: 'Historical Fiction',
        pages: 300,
        published: 'Apr 16, 2024',
        cover: 'book-1',
      },
      {
        title: 'Where the Stars Fall',
        author: "Liam O'Connor",
        genre: 'Romance',
        pages: 288,
        published: 'Apr 18, 2024',
        cover: 'book-5',
      },
      {
        title: 'The Edge of Tomorrow',
        author: 'Victoria Lane',
        genre: 'Sci-Fi',
        pages: 376,
        published: 'Apr 19, 2024',
        cover: 'book-2',
      },
    ],
  },
  {
    id: 'three-weeks-ago',
    label: 'Three Weeks Ago',
    range: 'Apr 07 – Apr 13, 2024',
    books: [
      {
        title: 'Tides of Destiny',
        author: 'Marcus Holloway',
        genre: 'Adventure',
        pages: 390,
        published: 'Apr 07, 2024',
        cover: 'book-2',
      },
      {
        title: 'A Crown of Secrets',
        author: 'Sophie de Lacour',
        genre: 'Fantasy',
        pages: 352,
        published: 'Apr 09, 2024',
        cover: 'book-5',
      },
      {
        title: 'Into the Silence',
        author: 'Oliver Bennett',
        genre: 'Thriller',
        pages: 304,
        published: 'Apr 11, 2024',
        cover: 'book-1',
      },
      {
        title: 'The Promise We Made',
        author: 'Hannah Cole',
        genre: 'Contemporary Fiction',
        pages: 332,
        published: 'Apr 12, 2024',
        cover: 'book-4',
      },
    ],
  },
]

// Resolve `cover` to a real path once, so no component has to know the
// asset naming convention.
const withCoverSrc = (b) => ({ ...b, coverSrc: `/assets/${b.cover}.png` })

export const WEEKS_RESOLVED = WEEKS.map((w) => ({ ...w, books: w.books.map(withCoverSrc) }))

// The homepage always features the most recent entry.
export const CURRENT_WEEK = WEEKS_RESOLVED[0]

// Shared link helper so the two layouts stay consistent.
export const weekBookHref = (book) => (book.slug ? `/books/${book.slug}` : null)

export const WEEKS_HREF = '/books-of-the-week'
