// Small shared UI pieces: gold 4-point star, divider, arrow icon, sparkles.

export function Star4({ size = 16, color = '#C9962F' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 0C13.1 6.9 17.1 10.9 24 12C17.1 13.1 13.1 17.1 12 24C10.9 17.1 6.9 13.1 0 12C6.9 10.9 10.9 6.9 12 0Z"
        fill={color}
      />
    </svg>
  )
}

export function Divider({ align = 'center', width = 340 }) {
  return (
    <div className={`divider divider-${align}`} style={{ width }} aria-hidden="true">
      <i />
      <Star4 size={17} />
      <i />
    </div>
  )
}

export function ArrowRight({ size = 20, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M4 12H20M20 12L13.5 5.5M20 12L13.5 18.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Sparkle({ className, size = 18, delay = 0 }) {
  return (
    <span className={`sparkle ${className || ''}`} style={{ animationDelay: `${delay}s` }} aria-hidden="true">
      <Star4 size={size} color="#D9A22E" />
    </span>
  )
}
