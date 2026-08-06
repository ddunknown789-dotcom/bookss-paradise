import Link from 'next/link'

import PageHead from '@/components/admin/PageHead'
import { Badge, Ic } from '@/components/admin/ui'
import { requireRole, can } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'

export const metadata = { title: 'Dashboard' }

const rel = (iso: string): string => {
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams
  const user = await requireRole('editor')
  const db = await adminDb()

  const count = async (table: string, apply?: (q: any) => any) => {
    let q = db.from(table as never).select('*', { head: true, count: 'exact' })
    if (apply) q = apply(q)
    const { count: n } = await q
    return n ?? 0
  }

  const [books, drafts, authors, pending, interviews, media, subscribers] = await Promise.all([
    count('books', (q) => q.eq('status', 'published')),
    count('books', (q) => q.eq('status', 'draft')),
    count('authors'),
    count('reviews', (q) => q.eq('status', 'pending')),
    count('interviews', (q) => q.eq('status', 'published')),
    count('media'),
    count('subscribers'),
  ])

  const { data: activity } = await db
    .from('audit_log')
    .select('id, actor_email, action, entity, summary, created_at')
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: recentBooks } = await db
    .from('books')
    .select('id, title, slug, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(6)

  const stats = [
    { label: 'Published books', value: books, href: '/admin/books' },
    { label: 'Drafts', value: drafts, href: '/admin/books?status=draft' },
    { label: 'Authors', value: authors, href: '/admin/authors' },
    { label: 'Reviews awaiting approval', value: pending, href: '/admin/reviews?status=pending' },
    { label: 'Interviews', value: interviews, href: '/admin/interviews' },
    { label: 'Media files', value: media, href: '/admin/media' },
    { label: 'Subscribers', value: subscribers, href: '/admin/settings' },
  ]

  return (
    <>
      <PageHead
        title={`Welcome back${user.profile.full_name ? `, ${user.profile.full_name.split(' ')[0]}` : ''}`}
        sub="Everything on the public site is managed from here."
      />

      {denied && (
        <div className="ad-alert ad-alert-warn">
          <Ic n="alert" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
          <span>That area needs a higher role than your account has. Ask an owner or admin if you need access.</span>
        </div>
      )}

      {pending > 0 && can(user.profile.role, 'reviews') && (
        <div className="ad-alert ad-alert-info">
          <Ic n="alert" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
          <span>
            <b>{pending}</b> {pending === 1 ? 'review is' : 'reviews are'} waiting for approval.{' '}
            <Link href="/admin/reviews?status=pending" style={{ textDecoration: 'underline' }}>
              Review {pending === 1 ? 'it' : 'them'}
            </Link>
          </span>
        </div>
      )}

      <div className="ad-grid ad-grid-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="ad-stat ad-stat-link">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="ad-split">
        <section className="ad-panel">
          <div className="ad-panel-head">
            <h2>Recently edited</h2>
            <span className="ad-right">
              <Link href="/admin/books" className="ad-btn ad-btn-sm">All books</Link>
            </span>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <tbody>
                {(recentBooks ?? []).map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/admin/books/${b.id}`} style={{ fontWeight: 600 }}>{b.title}</Link>
                    </td>
                    <td className="ad-tight"><Badge value={b.status} /></td>
                    <td className="ad-tight ad-faint">{rel(b.updated_at)}</td>
                  </tr>
                ))}
                {!recentBooks?.length && (
                  <tr><td className="ad-muted" style={{ padding: 20 }}>Nothing yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ad-panel">
          <div className="ad-panel-head"><h2>Activity</h2></div>
          <div className="ad-panel-body" style={{ paddingTop: 10 }}>
            {(activity ?? []).length ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {(activity ?? []).map((a) => (
                  <li key={a.id} style={{ fontSize: 12.6, lineHeight: 1.45 }}>
                    <div>
                      <b style={{ fontWeight: 600 }}>{a.summary ?? `${a.action} ${a.entity}`}</b>
                    </div>
                    <div className="ad-faint">
                      {a.actor_email?.split('@')[0] ?? 'system'} · {rel(a.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ad-muted" style={{ fontSize: 13 }}>
                Changes you make will show up here, with who made them and when.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
