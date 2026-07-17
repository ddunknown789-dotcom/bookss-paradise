import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'

export default function Intro() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      // Cinematic load-in: logo blooms in the centre of a pure white screen.
      gsap.fromTo(
        '.intro-logo-wrap',
        { scale: 0.68, opacity: 0, y: 26 },
        { scale: 1, opacity: 1, y: 0, duration: 1.7, ease: 'power3.out', delay: 0.2 },
      )
      gsap.fromTo('.intro-cue', { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 1.6 })
      gsap.to('.intro-float', {
        y: -13,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.9,
      })

      // Scroll scrub: logo recedes upward and dissolves as the story begins.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom 85%',
            scrub: true,
          },
        })
        .to('.intro-logo-wrap', { scale: 0.34, yPercent: -60, opacity: 0, ease: 'power1.in' }, 0)
        .to('.intro-cue', { opacity: 0, duration: 0.2 }, 0)

      // Gentle 3D tilt following the mouse.
      const xTo = gsap.quickTo('.intro-logo', 'rotationY', { duration: 0.7, ease: 'power2.out' })
      const yTo = gsap.quickTo('.intro-logo', 'rotationX', { duration: 0.7, ease: 'power2.out' })
      const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        xTo(nx * 14)
        yTo(-ny * 12)
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="intro" ref={root} aria-label="@Bookss.Paradise">
      <div className="intro-pin">
        <div className="intro-float">
          <div className="intro-logo-wrap">
            <img className="intro-logo" src="/assets/logo.png" alt="@Bookss.Paradise" draggable="false" />
          </div>
        </div>
        <div className="intro-cue">
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  )
}
