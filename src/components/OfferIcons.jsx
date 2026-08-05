// Gold-on-emerald service emblems for the "What We Offer" section.
// Every icon is one inline SVG: a laurel wreath, a dark green disc with a gold
// rim, and a monoline gold glyph — so they scale crisply and stay on-palette.

import { useId } from 'react'

const CX = 120
const CY = 120
const DISC = 74 // disc radius
const RING = 86 // radius the laurel leaf bases sit on

const LEAF = 'M0 0C7.6 -5.4 9.6 -13.6 1.4 -21.4C-6 -13.8 -6.4 -5.8 0 0Z'

const pt = (deg, r) => {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)]
}

// One half of the wreath. `side` is -1 (left) or +1 (right); angles run from
// near the top down to just short of the bottom, leaving the classic gaps.
function branch(side, id) {
  const n = 11
  const a0 = 34
  const a1 = 168
  const leaves = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const a = side * (a0 + (a1 - a0) * t)
    const s = 0.68 + 0.5 * Math.sin(Math.PI * t)
    return (
      <path
        key={i}
        d={LEAF}
        transform={`rotate(${a} ${CX} ${CY}) translate(${CX} ${CY - RING}) rotate(${-34 * side}) scale(${s})`}
      />
    )
  })
  const [sx, sy] = pt(side * (a0 - 2), RING - 6)
  const [ex, ey] = pt(side * (a1 + 3), RING - 6)
  return (
    <g key={side} fill={`url(#${id}-gold)`}>
      <path
        d={`M${sx} ${sy}A${RING - 6} ${RING - 6} 0 0 ${side > 0 ? 1 : 0} ${ex} ${ey}`}
        fill="none"
        stroke={`url(#${id}-gold)`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".75"
      />
      {leaves}
    </g>
  )
}

const STAR = 'M0 -7C.8 -2.6 2.6 -.8 7 0C2.6 .8 .8 2.6 0 7C-.8 2.6 -2.6 .8 -7 0C-2.6 -.8 -.8 -2.6 0 -7Z'

/* ----------------------------- glyphs ----------------------------- */
/* Each is drawn inside a group already translated to the disc centre, so the
   coordinates below run roughly -44…44 in both axes. */

function TileMark({ x, y, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-19" y="-19" width="38" height="38" rx="11" opacity=".95" />
      {children}
    </g>
  )
}

const GLYPHS = {
  // Book features across social platforms — four monoline platform marks.
  social: (
    <>
      <TileMark x={-21} y={-21}>
        <rect x="-8.4" y="-8.4" width="16.8" height="16.8" rx="5.4" />
        <circle r="4.6" />
        <circle cx="5.6" cy="-5.6" r="1.2" fill="currentColor" stroke="none" />
      </TileMark>
      <TileMark x={21} y={-21}>
        <path d="M3.6 -9.6H1.2C-1.5 -9.6 -2.9 -8.1 -2.9 -5.2V-2.1H-6.2V1.9H-2.9V9.8" strokeLinecap="round" />
        <path d="M-2.9 1.9H2.2" strokeLinecap="round" />
      </TileMark>
      <TileMark x={-21} y={21}>
        <circle r="9.2" />
        <ellipse rx="4.1" ry="9.2" />
        <path d="M-8.6 -3.4H8.6M-8.6 3.4H8.6" strokeLinecap="round" />
      </TileMark>
      <TileMark x={21} y={21}>
        <rect x="-10.4" y="-7.8" width="20.8" height="15.6" rx="5.2" />
        <path d="M-2.6 -4.3L4.8 0L-2.6 4.3Z" fill="currentColor" stroke="none" />
      </TileMark>
    </>
  ),

  // Honest reviews — fountain pen resting beside an inkwell.
  pen: (
    <>
      <rect x="-38" y="4" width="24" height="7" rx="3.5" />
      <path d="M-35 11H-17A5 5 0 0 1 -12 16V29A5 5 0 0 1 -17 34H-35A5 5 0 0 1 -40 29V16A5 5 0 0 1 -35 11Z" />
      <path d="M-39.4 23H-12.6V29A5 5 0 0 1 -17.6 34H-34.4A5 5 0 0 1 -39.4 29Z" fill="currentColor" opacity=".5" stroke="none" />
      <g transform="translate(17 -6) rotate(38) scale(.95)">
        <path d="M-7 -46H7A3 3 0 0 1 10 -43V-4H-10V-43A3 3 0 0 1 -7 -46Z" />
        <rect x="-10" y="-11" width="20" height="7" rx="2" fill="currentColor" opacity=".5" stroke="none" />
        <path d="M-8.6 -4H8.6L5.4 15L0 30L-5.4 15Z" />
        <circle cy="6" r="2.6" />
        <path d="M0 10V27" strokeLinecap="round" />
      </g>
    </>
  ),

  // Cinematic video — a projector with twin reels.
  film: (
    <>
      <circle cx="-19" cy="-23" r="15" />
      <circle cx="-19" cy="-23" r="3.6" fill="currentColor" stroke="none" />
      <circle cx="-19" cy="-31" r="2.6" />
      <circle cx="-11.5" cy="-19" r="2.6" />
      <circle cx="-26.5" cy="-19" r="2.6" />
      <circle cx="17" cy="-26" r="11.5" />
      <circle cx="17" cy="-26" r="3" fill="currentColor" stroke="none" />
      <rect x="-34" y="-8" width="50" height="30" rx="6" />
      <path d="M16 -1L34 -10V22L16 13Z" />
      <path d="M-24 22V29M4 22V29M-33 29H13" strokeLinecap="round" />
    </>
  ),

  // Website creation — a browser window on a monitor, with a pointer.
  website: (
    <>
      <rect x="-38" y="-32" width="76" height="53" rx="6" />
      <path d="M-38 -19H38" />
      <circle cx="-31" cy="-25.5" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="-24" cy="-25.5" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="-17" cy="-25.5" r="1.9" fill="currentColor" stroke="none" />
      <rect x="-30" y="-11" width="21" height="17" rx="3" />
      <path d="M-2 -9H30M-2 -1.5H23M-2 6H30" strokeLinecap="round" />
      <path d="M-11 21V30M11 21V30M-21 30H21" strokeLinecap="round" />
      <path
        d="M9 1L9 25L15.4 19.2L19.8 29L24.8 26.6L20.2 17.2L29 16Z"
        fill="currentColor"
        stroke="var(--emblem-ink, #12332a)"
        strokeWidth="4"
        strokeLinejoin="round"
        paintOrder="stroke"
      />
    </>
  ),

  // Author features — an open book with a quill and ink.
  author: (
    <>
      <path d="M0 -8C-8 -16 -22 -19 -36 -18V22C-22 21 -8 24 0 32C8 24 22 21 36 22V-18C22 -19 8 -16 0 -8Z" />
      <path d="M0 -8V32" />
      <path d="M-28 -6H-9M-28 2H-9M-28 10H-13" strokeLinecap="round" opacity=".8" />
      <g transform="translate(19 -4)">
        <path d="M15 -38C1 -33 -8 -21 -10 -8C-11.6 2 -6 6 0 2C9 -4 15 -21 15 -38Z" />
        <path d="M-10 -8L-19 6" strokeLinecap="round" />
        <path d="M9 -30C4 -25 -1 -16 -4 -6M2 -30L-3 -26M6 -21L1 -17" strokeLinecap="round" opacity=".7" />
      </g>
    </>
  ),

  // Book blogs — a laptop showing a post.
  blog: (
    <>
      <rect x="-33" y="-31" width="66" height="45" rx="4" />
      <path d="M-24 -21H24M-24 -13H13M-24 -5H24M-24 3H8" strokeLinecap="round" opacity=".85" />
      <path d="M-42 20H42A5 5 0 0 1 37 27H-37A5 5 0 0 1 -42 20Z" />
      <path d="M-33 14H33" opacity=".7" />
    </>
  ),
}

export default function OfferEmblem({ glyph, className }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#F2DCA2" />
          <stop offset="0.42" stopColor="#D9AE52" />
          <stop offset="0.7" stopColor="#B8862A" />
          <stop offset="1" stopColor="#E8CC8C" />
        </linearGradient>
        <radialGradient id={`${id}-disc`} cx="0.36" cy="0.28" r="0.86">
          <stop offset="0" stopColor="#1d4a3a" />
          <stop offset="0.58" stopColor="#123329" />
          <stop offset="1" stopColor="#0a231c" />
        </radialGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {branch(-1, id)}
      {branch(1, id)}

      {/* sparkles closing the wreath at the top */}
      <g fill={`url(#${id}-gold)`}>
        <path d={STAR} transform={`translate(${pt(-16, RING + 2).join(' ')}) scale(.86)`} />
        <path d={STAR} transform={`translate(${pt(16, RING + 2).join(' ')}) scale(.86)`} />
        <circle cx={pt(-27, RING + 6)[0]} cy={pt(-27, RING + 6)[1]} r="1.9" />
        <circle cx={pt(27, RING + 6)[0]} cy={pt(27, RING + 6)[1]} r="1.9" />
      </g>

      <circle cx={CX} cy={CY} r={DISC} fill={`url(#${id}-disc)`} />
      <ellipse cx={CX} cy={CY - 24} rx={DISC - 12} ry={DISC - 34} fill={`url(#${id}-sheen)`} />
      <circle cx={CX} cy={CY} r={DISC} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="3.4" />
      <circle cx={CX} cy={CY} r={DISC - 7} fill="none" stroke="#D9B76D" strokeOpacity=".34" strokeWidth="1" />

      <g
        transform={`translate(${CX} ${CY}) scale(1.05)`}
        fill="none"
        stroke={`url(#${id}-gold)`}
        strokeWidth="2.6"
        strokeLinejoin="round"
        color="#E4C57F"
      >
        {GLYPHS[glyph]}
      </g>
    </svg>
  )
}

// Small open book used as the closing ornament under the grid.
export function BookOrnament({ size = 30 }) {
  return (
    <svg viewBox="0 0 48 34" width={size} height={size * (34 / 48)} aria-hidden="true" focusable="false">
      <g fill="none" stroke="#C39A3E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 8C19 3 11 1.6 3 2.4V27.6C11 26.8 19 28.2 24 32C29 28.2 37 26.8 45 27.6V2.4C37 1.6 29 3 24 8Z" />
        <path d="M24 8V32" />
      </g>
    </svg>
  )
}
