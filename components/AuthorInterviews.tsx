'use client'

import type { InterviewsContent } from '@/lib/cms/sections'
import type { InterviewView } from '@/lib/cms/types'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { NOANIM } from '@/lib/anim'
import { Divider, ArrowRight } from './ui'

function InterviewBadge() {
  return (
    <span className="interview-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h6.2c.4 0 .78.16 1.06.44l3.8 3.8c.28.28.44.66.44 1.06V18.5A1.5 1.5 0 0 1 17.5 20h-10A1.5 1.5 0 0 1 6 18.5z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M14 4.2V8.2a.8.8 0 0 0 .8.8h4" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M9 11h6M9 14h6M9 17h4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </span>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="15" height="15" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.8v4.65l3.1 1.85" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AuthorInterviews({ content, interviews }: { content: InterviewsContent; interviews: InterviewView[] }) {
  const root = useRef<any>(null)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.interviews-head > *',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 76%' },
        },
      )
      gsap.fromTo(
        '.interview-card',
        { y: 46, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.interviews-grid', start: 'top 82%' },
        },
      )
      gsap.fromTo(
        '.interviews-cta',
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.interviews-grid', start: 'top 58%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="interviews card" id="interviews" ref={root}>
      <div className="interviews-head section-head">
        <h2 className="section-title">{content.heading}</h2>
        <Divider width={300} />
        <p className="interviews-sub">{content.subheading}</p>
      </div>

      <div className="interviews-grid">
        {interviews.map((item) => (
          <a className="interview-card" key={item.slug} href={item.href} aria-label={`${item.title} for ${item.bookTitle}`}>
            <div className="interview-media">
              <img src={item.image} alt={item.title} loading="lazy" />
              <InterviewBadge />
            </div>

            <div className="interview-body">
              <div className="interview-kicker">Interview</div>
              <h3>{item.title}</h3>
              <p className="interview-book">{item.bookTitle}</p>

              <div className="interview-meta">
                <span><ClockIcon /> {item.minutes}</span>
                <time dateTime={item.iso ?? undefined}>{item.date}</time>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="interviews-cta">
        <a className="btn btn-gold-bright btn-interviews" href={content.cta.href}>
          {content.cta.label} <ArrowRight size={20} />
        </a>
      </div>
    </section>
  )
}
