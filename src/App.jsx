import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import ParticleField from './components/ParticleField'
import SplashCursor from './components/SplashCursor'
import Nav from './components/Nav'
import Intro from './components/Intro'
import Hero from './components/Hero'
import Offer from './components/Offer'
import Trailer from './components/Trailer'
import TopPicks from './components/TopPicks'
import Mission from './components/Mission'
import Community from './components/Community'
import Reviews from './components/Reviews'
import BooksOfWeek from './components/BooksOfWeek'
import AuthorInterviews from './components/AuthorInterviews'
import Newsletter from './components/Newsletter'
import Loader from './components/Loader'
import BooksCollection from './components/BooksCollection'
import BookPage from './pages/BookPage'
import BookLongPage from './pages/BookLongPage'
import InterviewPage from './pages/InterviewPage'
import WeeksPage from './pages/WeeksPage'
import { getBook } from './data/books'
import { getInterview } from './data/interviews'
import { WEEKS_HREF } from './data/weeks'
import { NOANIM, IS_SMALL } from './lib/anim'
import { usePath } from './lib/router'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV && typeof window !== 'undefined') window.gsap = gsap

export default function App() {
  // Simple pathname routing: '/' is the scroll experience, '/books' the
  // collection, '/books/<slug>' a single book's detail page. `usePath` is
  // reactive (router.js intercepts internal link clicks + back/forward), so
  // moving between these never remounts the app or replays the loader.
  const path = usePath()
  const isBooksPage = path === '/books'
  // '/books-of-the-week' — the full weekly archive. Checked as an exact
  // match so it never collides with '/books' or '/books/<slug>'.
  const isWeeksPage = path === WEEKS_HREF
  // '/books/<slug>' and '/books/<slug>/review' | '/books/<slug>/summary'
  const bookParts = path.startsWith('/books/') ? path.slice('/books/'.length).split('/') : []
  const bookSlug = bookParts[0] || null
  const bookView = bookParts[1] || null // 'review' | 'summary' | null
  const book = bookSlug ? getBook(bookSlug) : null
  // '/interviews/<slug>'
  const interviewSlug = path.startsWith('/interviews/') ? path.slice('/interviews/'.length) : null
  const interview = interviewSlug ? getInterview(interviewSlug) : null
  // Guard against environments that briefly report a 0-height viewport at
  // mount: ScrollTriggers created at that moment would mis-measure everything.
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && window.innerHeight > 0)
  // Two flags so the loader and the site overlap for one beat: `siteUp` mounts
  // the page underneath while the loader is still dissolving, so the logo
  // intro blooms *through* the fade instead of appearing after a blank frame.
  const [siteUp, setSiteUp] = useState(NOANIM)
  const [loaderGone, setLoaderGone] = useState(NOANIM)

  useEffect(() => {
    if (ready) return
    const id = setInterval(() => {
      if (window.innerHeight > 0) {
        setReady(true)
        clearInterval(id)
      }
    }, 50)
    return () => clearInterval(id)
  }, [ready])

  // Hold the page still while the loader is up, and make sure we always begin
  // the experience at the very top.
  useEffect(() => {
    if (loaderGone) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => { document.body.style.overflow = prev }
  }, [loaderGone])

  useEffect(() => {
    if (!ready || !siteUp) return
    if (NOANIM) {
      document.body.classList.add('noanim')
      // ?goto=<section-class> jumps straight to a section (verification aid)
      const goto = new URLSearchParams(window.location.search).get('goto')
      if (goto) {
        setTimeout(() => {
          const el = document.querySelector(`.${goto}`)
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
        }, 300)
      }
      return
    }
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    // re-measure once every asset (fonts, images) has arrived
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    // router.js restores scroll position on back/forward navigation; it
    // needs this to go through Lenis, or Lenis snaps the jump right back.
    window.__lenis = lenis
    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [ready, siteUp])

  if (!ready) return <ParticleField />

  if (isBooksPage) {
    return (
      <>
        <ParticleField />
        <BooksCollection />
      </>
    )
  }

  if (isWeeksPage) return <WeeksPage />

  // A /books/<slug> URL that doesn't match any book still needs a real page
  // rather than a blank screen.
  if (bookSlug) {
    // An unknown slug, or an unknown sub-view, still needs a real page rather
    // than a blank screen.
    const knownView = bookView === null || bookView === 'review' || bookView === 'summary'
    if (!book || !knownView) {
      return (
        <main className="bp-missing">
          <h1>{book ? 'Page not found' : 'Book not found'}</h1>
          <p>We couldn’t find anything at this address.</p>
          <a className="bp-btn bp-btn-gold bp-btn-lg" href={book ? `/books/${book.slug}` : '/books'}>
            {book ? `Back to ${book.title}` : 'Browse all books'}
          </a>
        </main>
      )
    }
    if (bookView) return <BookLongPage book={book} kind={bookView} />
    return <BookPage book={book} />
  }

  // An unknown /interviews/<slug> still needs a real page rather than a
  // blank screen.
  if (interviewSlug) {
    if (!interview) {
      return (
        <main className="bp-missing">
          <h1>Interview not found</h1>
          <p>We couldn’t find anything at this address.</p>
          <a className="bp-btn bp-btn-gold bp-btn-lg" href="/#interviews">Back to All Interviews</a>
        </main>
      )
    }
    return <InterviewPage item={interview} />
  }

  return (
    <>
      {!loaderGone && (
        <Loader
          onReveal={() => setSiteUp(true)}
          onDone={() => setLoaderGone(true)}
        />
      )}
      {!siteUp ? null : (
      <>
      <ParticleField />
      {/* Runs on desktop (mouse) AND mobile (finger drag). Phones get a
          lighter sim so trails stay smooth and easy on the battery. */}
      <SplashCursor
        RAINBOW_MODE={false}
        COLOR="#d4a02f"
        BACK_COLOR={{ r: 0, g: 0, b: 0 }}
        SPLAT_RADIUS={IS_SMALL ? 0.3 : 0.22}
        SPLAT_FORCE={IS_SMALL ? 6200 : 5200}
        DENSITY_DISSIPATION={IS_SMALL ? 3.6 : 4.2}
        VELOCITY_DISSIPATION={2.4}
        CURL={2.4}
        SIM_RESOLUTION={IS_SMALL ? 96 : 128}
        DYE_RESOLUTION={IS_SMALL ? 512 : 1440}
        SHADING={!IS_SMALL}
      />
      <Nav />
      <main>
        <Intro />
        <Hero />
        <Trailer />
        <TopPicks />
        <Reviews />
        <BooksOfWeek />
        <AuthorInterviews />
        <Mission />
        <Community />
        <Offer />
        <Newsletter />
      </main>
      </>
      )}
    </>
  )
}
