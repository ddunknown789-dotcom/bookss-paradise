import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { NOANIM } from '../lib/anim'
import { Divider } from './ui'
import OptionWheel from './OptionWheel'

const ITEMS = [
  { icon: 'icon-trailers', label: 'Book Trailers', desc: 'Cinematic trailers that bring stories to life.' },
  { icon: 'icon-reviews', label: 'Honest Reviews', desc: 'Real opinions from real readers.' },
  { icon: 'icon-curated', label: 'Curated Books', desc: 'Handpicked books you’ll love.' },
  { icon: 'icon-authors', label: 'Author Features', desc: 'Spotlight on amazing authors.' },
  { icon: 'icon-community', label: 'Community', desc: 'A growing community of book lovers.' },
  { icon: 'icon-updates', label: 'Updates & More', desc: 'Stay updated with new releases.' },
]

export default function Offer() {
  const root = useRef(null)
  const [active, setActive] = useState(2)

  useLayoutEffect(() => {
    if (NOANIM) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.offer-head > *',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        },
      )
      gsap.fromTo(
        '.offer-stage',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.offer-stage', start: 'top 82%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  // Crossfade the detail panel whenever the wheel lands on a new service.
  const detail = useRef(null)
  useLayoutEffect(() => {
    if (NOANIM || !detail.current) return
    gsap.fromTo(
      detail.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: true },
    )
  }, [active])

  const current = ITEMS[active]

  return (
    <section className="offer card" id="offer" ref={root}>
      <div className="offer-head section-head">
        <h2 className="section-title">What We Offer</h2>
        <Divider width={300} />
      </div>

      <div className="offer-stage">
        <OptionWheel
          items={ITEMS}
          defaultSelected={2}
          onChange={(i) => setActive(i)}
          textColor="#9aa79d"
          activeColor="#1f4634"
          fontSize={1.45}
          spacing={1.65}
          curve={1}
          tilt={6}
          blur={1.6}
          fade={0.26}
          smoothing={200}
          // the curve pushes options leftward, so leave room or they clip
          inset={54}
          draggable
          // the page keeps its own scrolling; the wheel turns by drag/click/keys
          scrollCapture={false}
          className="offer-wheel"
          renderItem={(item) => (
            <span className="ow-row">
              <span className="ow-icon">
                <img src={`/assets/${item.icon}.png`} alt="" loading="lazy" />
              </span>
              <span className="ow-label">{item.label}</span>
            </span>
          )}
        />

        <div className="offer-detail" ref={detail} key={active}>
          <div className="offer-detail-icon">
            <img src={`/assets/${current.icon}.png`} alt="" />
          </div>
          <h3>{current.label}</h3>
          <p>{current.desc}</p>
        </div>
      </div>

      <p className="offer-hint" aria-hidden="true">Drag or tap to explore</p>
    </section>
  )
}
