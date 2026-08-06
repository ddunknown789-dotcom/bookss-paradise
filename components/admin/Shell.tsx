'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Ic, ToastHost, type IconName } from './ui'
import type { UserRole } from '@/lib/supabase/database.types'

/* Everything in the sidebar, with the minimum role each item needs. Items the
   signed-in user can't use are not rendered at all — a dead link that always
   bounces you back is worse than a shorter menu. */
const NAV: { group: string; items: { href: string; label: string; icon: IconName; role: UserRole }[] }[] = [
  {
    group: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: 'dashboard', role: 'editor' }],
  },
  {
    group: 'Content',
    items: [
      { href: '/admin/books', label: 'Books', icon: 'book', role: 'editor' },
      { href: '/admin/authors', label: 'Authors', icon: 'user', role: 'editor' },
      { href: '/admin/reviews', label: 'Reviews', icon: 'star', role: 'editor' },
      { href: '/admin/interviews', label: 'Interviews', icon: 'mic', role: 'editor' },
      { href: '/admin/weeks', label: 'Book of the Week', icon: 'calendar', role: 'editor' },
      { href: '/admin/videos', label: 'Videos', icon: 'video', role: 'editor' },
      { href: '/admin/categories', label: 'Categories', icon: 'tag', role: 'editor' },
    ],
  },
  {
    group: 'Site',
    items: [
      { href: '/admin/homepage', label: 'Homepage', icon: 'layout', role: 'editor' },
      { href: '/admin/services', label: 'Services', icon: 'tag', role: 'editor' },
      { href: '/admin/navigation', label: 'Navigation', icon: 'menu', role: 'admin' },
      { href: '/admin/footer', label: 'Footer', icon: 'menu', role: 'admin' },
      { href: '/admin/media', label: 'Media Library', icon: 'image', role: 'editor' },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { href: '/admin/seo', label: 'SEO', icon: 'seo', role: 'admin' },
      { href: '/admin/settings', label: 'Settings', icon: 'settings', role: 'admin' },
      { href: '/admin/users', label: 'Team', icon: 'users', role: 'admin' },
    ],
  },
]

const RANK: Record<UserRole, number> = { owner: 3, admin: 2, editor: 1 }

export default function Shell({
  role,
  name,
  email,
  siteUrl,
  signOut,
  children,
}: {
  role: UserRole
  name: string
  email: string
  siteUrl: string
  signOut: () => Promise<void>
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? ''
  const [menuOpen, setMenuOpen] = useState(false)

  const allowed = (min: UserRole) => RANK[role] >= RANK[min]
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

  return (
    <ToastHost>
      <div className={`ad ${menuOpen ? 'is-menu-open' : ''}`}>
        <div className="ad-shell">
          <aside className={`ad-side ${menuOpen ? 'is-open' : ''}`}>
            <div className="ad-brand">
              <span className="ad-brand-mark">BP</span>
              <span className="ad-brand-text">
                <strong>Books Paradise</strong>
                <small>Content Manager</small>
              </span>
            </div>

            <nav className="ad-nav" aria-label="Admin">
              {NAV.map((group) => {
                const items = group.items.filter((i) => allowed(i.role))
                if (!items.length) return null
                return (
                  <div key={group.group}>
                    <div className="ad-nav-group">{group.group}</div>
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={isActive(item.href) ? 'is-active' : ''}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Ic n={item.icon} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </nav>

            <div className="ad-side-foot">
              <div className="ad-who">
                <span className="ad-avatar">{(name || email).slice(0, 1).toUpperCase()}</span>
                <span className="ad-who-text">
                  <b>{name || email}</b>
                  <span>{role}</span>
                </span>
              </div>
              <form action={signOut}>
                <button type="submit" className="ad-btn ad-btn-sm" style={{ width: '100%' }}>
                  <Ic n="logout" />
                  Sign out
                </button>
              </form>
            </div>
          </aside>

          {menuOpen && <div className="ad-menu-veil" onClick={() => setMenuOpen(false)} />}

          <div className="ad-main">
            <header className="ad-top">
              <button
                type="button"
                className="ad-btn ad-btn-ghost ad-btn-icon ad-burger"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
              >
                <Ic n="menu" />
              </button>
              <div id="ad-title-slot" />
              <div className="ad-top-actions">
                <a className="ad-btn ad-btn-sm" href={siteUrl || '/'} target="_blank" rel="noreferrer">
                  <Ic n="external" />
                  View site
                </a>
              </div>
            </header>
            <div className="ad-body">{children}</div>
          </div>
        </div>
      </div>
    </ToastHost>
  )
}
