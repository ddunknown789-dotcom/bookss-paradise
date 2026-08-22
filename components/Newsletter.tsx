'use client'

import type { NewsletterContent } from '@/lib/cms/sections'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { NOANIM } from '@/lib/anim'
import { has } from '@/lib/cms/optional'
import { Divider } from './ui'

export default function Newsletter({ content }: { content: NewsletterContent }) {
  const root = useRef<any>(null)
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  const buttonLabel = done ? content.successLabel : content.submitLabel

  return (
    <section className="news card" id="newsletter" ref={root}>
      <div className="news-inner">
        <div className="news-copy">
          {has(content.heading) && <h2 className="section-title">{content.heading}</h2>}
          <Divider align="left" width={320} />
          {has(content.body) && <p>{content.body}</p>}
          <form className="news-form" onSubmit={submit}>
            <input
              type="email"
              placeholder={content.placeholder || undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Your email address"
              required
            />
            {/* The wording is the button. With none set there is nothing to
                press, and the field still submits on Enter. */}
            {has(buttonLabel) && (
              <button className="btn btn-gold-bright btn-subscribe" type="submit">
                {buttonLabel}
              </button>
            )}
          </form>
        </div>
        {has(content.image) && (
          <figure className="news-art">
            <img
              src={content.image}
              alt={content.imageAlt}
              loading="lazy"
            />
          </figure>
        )}
      </div>
    </section>
  )
}
