import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { ArrowRight, Star4 } from './ui'

export default function Community() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.community-copy > *',
        { y: 34, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%' },
        },
      )
      gsap.fromTo(
        '.community-art img',
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%' },
        },
      )
      gsap.to('.community-art img', {
        y: -12,
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="community card" id="community" ref={root}>
      <div className="community-inner">
        <div className="community-copy">
          <h2 className="section-title">
            A Community<br />That Reads<br />Together<span className="gold-dot">.</span>
          </h2>
          <div className="divider divider-left community-divider" aria-hidden="true">
            <i />
            <Star4 size={13} />
            <i />
          </div>
          <p>Join thousands of book lovers who share recommendations, thoughts, and love for stories.</p>
          <a className="btn btn-gold-bright btn-community" href="#newsletter">
            Join Our Community <ArrowRight size={20} />
          </a>
        </div>
        <figure className="community-art">
          <img
            src="/assets/model/model-community.png"
            alt="Gold-framed portraits of readers arranged on a circular podium"
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  )
}
