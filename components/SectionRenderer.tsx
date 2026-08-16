'use client'

import Intro from './Intro'
import Hero from './Hero'
import Trailer from './Trailer'
import TopPicks from './TopPicks'
import Reviews, { type ReviewBook } from './Reviews'
import BooksOfWeek from './BooksOfWeek'
import AuthorInterviews from './AuthorInterviews'
import Mission from './Mission'
import Community from './Community'
import Offer from './Offer'
import Newsletter from './Newsletter'

import type { SectionRow } from '@/lib/cms/queries'
import type { SectionContentMap } from '@/lib/cms/sections'
import type {
  BookCardView,
  InterviewView,
  ServiceView,
  SocialLinkView,
  VideoCardView,
  WeekView,
} from '@/lib/cms/types'

export type SectionData = {
  books: BookCardView[]
  reviewBooks: ReviewBook[]
  videos: VideoCardView[]
  week: WeekView | null
  interviews: InterviewView[]
  services: ServiceView[]
  socials: SocialLinkView[]
}

/**
 * Renders the homepage from `page_sections`, in the order the admin set.
 *
 * Reordering a section in /admin reorders it here; hiding one removes it. The
 * markup each case renders is the original component untouched, so the layout
 * and animations are exactly what they were.
 */
export default function SectionRenderer({ sections, data }: { sections: SectionRow[]; data: SectionData }) {
  return (
    <>
      {sections.map((section) => {
        const c = section.content as SectionContentMap[typeof section.type]
        switch (section.type) {
          case 'intro':
            return <Intro key={section.id} socials={data.socials} />
          case 'hero':
            return <Hero key={section.id} content={c as SectionContentMap['hero']} />
          case 'videos':
            return <Trailer key={section.id} content={c as SectionContentMap['videos']} videos={data.videos} />
          case 'top_picks':
            return <TopPicks key={section.id} content={c as SectionContentMap['top_picks']} books={data.books} />
          case 'reviews':
            return <Reviews key={section.id} content={c as SectionContentMap['reviews']} books={data.reviewBooks} />
          case 'book_of_week':
            return <BooksOfWeek key={section.id} content={c as SectionContentMap['book_of_week']} week={data.week} />
          case 'interviews':
            return (
              <AuthorInterviews
                key={section.id}
                content={c as SectionContentMap['interviews']}
                interviews={data.interviews}
              />
            )
          case 'mission':
            return <Mission key={section.id} content={c as SectionContentMap['mission']} />
          case 'community':
            return <Community key={section.id} content={c as SectionContentMap['community']} />
          case 'offer':
            return <Offer key={section.id} content={c as SectionContentMap['offer']} services={data.services} />
          case 'newsletter':
            return <Newsletter key={section.id} content={c as SectionContentMap['newsletter']} />
          default:
            return null
        }
      })}
    </>
  )
}
