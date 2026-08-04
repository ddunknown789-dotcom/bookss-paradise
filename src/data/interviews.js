/* ============================================================================
   AUTHOR INTERVIEW DATA — single source of truth for every interview.

   TO EDIT AN INTERVIEW: find it below and change the values. Both the home
   page "Author Interviews" cards and each /interviews/<slug> page read from
   here, so nothing else needs to change.

   TO ADD ONE: copy an entry, point `bookSlug` at an existing book (see
   src/data/books.js), and it appears automatically. `intro` and `qa` are
   optional — leave them out and a book-specific intro + five questions are
   composed from that book's own data, same as the fullReview/fullSummary
   fallback pattern in books.js.
   ========================================================================== */

import { getBook } from './books'

const RAW_INTERVIEWS = [
  {
    bookSlug: 'the-silent-page',
    title: 'Interview with Lucas Elliot',
    image: '/assets/interview-1.png',
    minutes: '12 min read',
    date: 'May 12, 2024',
    iso: '2024-05-12',
    intro: 'We sat down with Lucas Elliot to talk about his writing journey, inspiration behind The Silent Page, and what’s next.',
    qa: [
      {
        q: 'What inspired you to write The Silent Page?',
        a: 'The Silent Page was inspired by the quiet moments we all carry—those unspoken thoughts that shape us. I wanted to write a story that gives a voice to the ones we often keep buried. It began as a personal reflection, but over time, it became something much bigger.',
      },
      {
        q: 'How did your personal journey influence the book?',
        a: 'A lot of my own experiences—loss, rediscovery, and hope—are woven into the story. There was a period in my life when I felt completely lost, and writing became my way of healing. The Silent Page is, in many ways, my journey back to myself. Every character carries a part of something I’ve lived through or learned.',
      },
      {
        q: 'Which character was the most challenging to write?',
        a: 'Without a doubt, Julian. He’s complex, layered, and sometimes even surprising to me. He represents the conflict between holding on and letting go. Getting inside his head took time, patience, and a lot of empathy. I wanted readers to understand him, even when they might not agree with his choices.',
      },
      {
        q: 'What message do you hope readers take away?',
        a: 'That it’s okay to feel lost sometimes. The Silent Page is about finding your voice, turning the page, and trusting that your story matters. I hope readers feel seen and reminded that every ending can also be a beginning.',
      },
      {
        q: 'What are you working on next?',
        a: 'I’m currently working on a new novel that explores memory and second chances. It’s a story about the past we can’t escape and the future we still have the power to change. I can’t share too much yet, but I’m very excited about it!',
      },
    ],
  },
  {
    bookSlug: 'beyond-the-horizon',
    title: 'In Conversation with Nora Elston',
    image: '/assets/interview-2.png',
    minutes: '10 min read',
    date: 'Apr 28, 2024',
    iso: '2024-04-28',
  },
  {
    bookSlug: 'the-lost-letters',
    title: 'A Chat with Madilyn Hart',
    image: '/assets/interview-3.png',
    minutes: '11 min read',
    date: 'Apr 15, 2024',
    iso: '2024-04-15',
  },
  {
    bookSlug: 'whispers-of-the-past',
    title: 'Behind the Story with Clara Bennett',
    image: '/assets/interview-4.png',
    minutes: '9 min read',
    date: 'Mar 30, 2024',
    iso: '2024-03-30',
  },
]

// Fallback intro + five questions, composed from the book's own fields so
// every interview reads specifically about that author even before anyone
// hand-writes it (mirrors the derive* pattern in src/data/books.js).
const deriveIntro = (book) =>
  `We sat down with ${book.author} to talk about the writing journey behind ${book.title}, and what’s next.`

const deriveQA = (book) => [
  { q: `What inspired you to write ${book.title}?`, a: book.about },
  {
    q: 'What was the hardest part of bringing this story to life?',
    a: book.special[1]?.text
      ? `${book.special[1].text} That was the part that took the longest to get right, and the part I’m proudest of now that it’s done.`
      : book.summaryBody,
  },
  {
    q: 'Which character do you feel closest to?',
    a: book.special[2]?.text || `Every character in ${book.title} borrows something from someone I’ve known, but one in particular stayed with me long after I finished writing.`,
  },
  { q: 'What message do you hope readers take away?', a: book.summaryBody },
  {
    q: 'What are you working on next?',
    a: `I’m already deep into something new — I can’t say too much yet, but it carries the same questions ${book.title} left me with.`,
  },
]

export const INTERVIEWS = RAW_INTERVIEWS.map((raw) => {
  const book = getBook(raw.bookSlug)
  return {
    ...raw,
    slug: raw.bookSlug, // one interview per book, so they share a slug
    book,
    author: book.author,
    bookTitle: book.title,
    intro: raw.intro || deriveIntro(book),
    qa: raw.qa || deriveQA(book),
  }
})

export const getInterview = (slug) => INTERVIEWS.find((i) => i.slug === slug)
export const interviewHref = (item) => `/interviews/${item.slug}`
