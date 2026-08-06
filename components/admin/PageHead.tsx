import Link from 'next/link'

import { Ic, type IconName } from './ui'

/**
 * The title block at the top of every admin screen. Kept as a server component
 * so pages can pass server-rendered actions straight through.
 */
export default function PageHead({
  title,
  sub,
  back,
  actions,
}: {
  title: string
  sub?: React.ReactNode
  back?: { href: string; label: string }
  actions?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 4 }}>
      <div style={{ minWidth: 0 }}>
        {back && (
          <Link href={back.href} className="ad-btn ad-btn-ghost ad-btn-sm" style={{ marginBottom: 6, marginLeft: -10 }}>
            <Ic n="up" style={{ transform: 'rotate(-90deg)' }} />
            {back.label}
          </Link>
        )}
        <h1 style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.015em' }}>{title}</h1>
        {sub && <p className="ad-muted" style={{ fontSize: 13, marginTop: 3 }}>{sub}</p>}
      </div>
      {actions && <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}

export function ActionLink({ href, icon, children, primary }: { href: string; icon?: IconName; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link href={href} className={`ad-btn ${primary ? 'ad-btn-primary' : ''}`}>
      {icon && <Ic n={icon} />}
      {children}
    </Link>
  )
}
