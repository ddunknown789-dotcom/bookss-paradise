'use client'

import type { TopPicksContent } from '@/lib/cms/sections'
import type { BookCardView } from '@/lib/cms/types'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '@/lib/anim'
import { has } from '@/lib/cms/optional'
import { Divider, ArrowRight } from './ui'

export default function TopPicks({ content, books }: { content: TopPicksContent; books: BookCardView[] }) {
  const root = useRef<any>(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.picks-head > *',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        },
      )
      gsap.fromTo(
        '.pick-book',
        { y: 70, opacity: 0, rotateZ: -1.5 },
        {
          y: 0, opacity: 1, rotateZ: 0, duration: 0.95, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: '.picks-shelf-zone', start: 'top 80%' },
        },
      )
      gsap.fromTo(
        '.picks-shelf',
        { scaleX: 0.6, opacity: 0 },
        {
          scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.picks-shelf-zone', start: 'top 80%' },
        },
      )
      gsap.fromTo(
        '.picks-cta',
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.picks-shelf-zone', start: 'top 60%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="picks card" id="books" ref={root}>
      <div className="picks-head section-head">
        {has(content.heading) && <h2 className="section-title">{content.heading}</h2>}
        <Divider width={300} />
      </div>
      <div className="picks-shelf-zone">
        <div className="picks-row">
          {books.filter((b) => has(b.coverSrc)).map((b) => {
            const label = has(b.author) ? `${b.title} by ${b.author}` : b.title
            return (
              <a className="pick-book" key={b.slug} href={b.href} aria-label={label}>
                <img src={b.coverSrc} alt={label} loading="lazy" />
              </a>
            )
          })}
        </div>
        {has(content.shelfImage) && <img className="picks-shelf" src={content.shelfImage} alt="" loading="lazy" />}
      </div>
      {has(content.cta.label) && has(content.cta.href) && (
        <div className="picks-cta">
          <a className="btn btn-gold-bright btn-viewall" href={content.cta.href}>
            {content.cta.label} <ArrowRight size={20} />
          </a>
        </div>
      )}
    </section>
  )
}
