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
import Newsletter from './components/Newsletter'
import Loader from './components/Loader'
import { NOANIM, IS_SMALL } from './lib/anim'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV && typeof window !== 'undefined') window.gsap = gsap

export default function App() {
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
    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [ready, siteUp])

  if (!ready) return <ParticleField />

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
        <Offer />
        <Trailer />
        <TopPicks />
        <Mission />
        <Community />
        <Reviews />
        <Newsletter />
      </main>
      </>
      )}
    </>
  )
}
