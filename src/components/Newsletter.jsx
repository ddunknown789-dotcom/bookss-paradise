import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider } from './ui'

export default function Newsletter() {
  const root = useRef(null)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.news-copy > *',
        { y: 34, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%' },
        },
      )
      gsap.fromTo(
        '.news-art img',
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.15, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%' },
        },
      )
      gsap.to('.news-art img', {
        y: -10,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  return (
    <section className="news card" id="newsletter" ref={root}>
      <div className="news-inner">
        <div className="news-copy">
          <h2 className="section-title">Stay in the Loop</h2>
          <Divider align="left" width={320} />
          <p>Get the latest book updates, trailers, reviews, and recommendations straight to your inbox.</p>
          <form className="news-form" onSubmit={submit}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Your email address"
              required
            />
            <button className="btn btn-gold-bright btn-subscribe" type="submit">
              {done ? 'Subscribed ✓' : 'Subscribe'}
            </button>
          </form>
        </div>
        <figure className="news-art">
          <img
            src="/assets/model/model-news.png"
            alt="Reader writing with a quill at a desk while a green envelope floats above"
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  )
}
