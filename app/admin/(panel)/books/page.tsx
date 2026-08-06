import Link from 'next/link'

import PageHead, { ActionLink } from '@/components/admin/PageHead'
import BookRowActions from '@/components/admin/BookRowActions'
import { Badge, Empty, Ic } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { SUPABASE_URL } from '@/lib/supabase/env'

export const metadata = { title: 'Books' }

const STATUSES = ['all', 'published', 'draft', 'archived'] as const

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  await requireRole('editor')
  const { status = 'all', q = '' } = await searchParams
  const db = await adminDb()

  let query = db
    .from('books')
    .select('id, slug, title, status, featured, rating, sort_order, updated_at, author:authors(name), cover:media!books_cover_id_fkey(path)')
    .order('sort_order')
    .limit(500)

  if (status !== 'all') query = query.eq('status', status as never)
  if (q.trim()) query = query.ilike('title', `%${q.trim()}%`)

  const { data: books } = await query

  const { data: counts } = await db.from('books').select('status')
  const tally = (s: string) => (counts ?? []).filter((b) => b.status === s).length

  return (
    <>
      <PageHead
        title="Books"
        sub="Every title on the site. Drafts are invisible to visitors until published."
        actions={<ActionLink href="/admin/books/new" icon="plus" primary>New book</ActionLink>}
      />

      <section className="ad-panel">
        <div className="ad-panel-head" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div className="ad-tabs" style={{ border: 'none', margin: 0 }}>
            {STATUSES.map((s) => (
              <Link
                key={s}
                href={`/admin/books${s === 'all' ? '' : `?status=${s}`}`}
                className={`ad-tab ${status === s ? 'is-active' : ''}`}
              >
                {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
                {s !== 'all' && <span className="ad-faint"> ({tally(s)})</span>}
              </Link>
            ))}
          </div>
          <form className="ad-right" style={{ marginLeft: 'auto' }}>
            {status !== 'all' && <input type="hidden" name="status" value={status} />}
            <div className="ad-search">
              <Ic n="search" />
              <input className="ad-input" name="q" defaultValue={q} placeholder="Search titles…" style={{ width: 220 }} />
            </div>
          </form>
        </div>

        {books?.length ? (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Order</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {books.map((b) => {
                  const row = b as unknown as {
                    id: string; slug: string; title: string; status: string; featured: boolean
                    rating: number | null; sort_order: number
                    author: { name: string } | null; cover: { path: string } | null
                  }
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="ad-cell-main">
                          {row.cover?.path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={`${SUPABASE_URL}/storage/v1/object/public/media/${row.cover.path}`} alt="" />
                          ) : (
                            <span style={{ width: 34, height: 46, borderRadius: 4, background: '#eee9de', flex: '0 0 auto' }} />
                          )}
                          <span className="ad-cell-title">
                            <b>
                              <Link href={`/admin/books/${row.id}`}>{row.title}</Link>
                              {row.featured && <span className="ad-badge ad-badge-admin" style={{ marginLeft: 7 }}>featured</span>}
                            </b>
                            <span>{row.author?.name ?? 'No author'} · /{row.slug}</span>
                          </span>
                        </div>
                      </td>
                      <td className="ad-tight"><Badge value={row.status} /></td>
                      <td className="ad-tight">{row.rating ? `★ ${row.rating}` : <span className="ad-faint">—</span>}</td>
                      <td className="ad-tight ad-faint">{row.sort_order}</td>
                      <td className="ad-tight">
                        <BookRowActions id={row.id} slug={row.slug} title={row.title} status={row.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={q ? 'No books match' : 'No books yet'}
            body={q ? 'Try a different search.' : 'Add your first title and it appears on the site once published.'}
            action={<ActionLink href="/admin/books/new" icon="plus" primary>New book</ActionLink>}
          />
        )}
      </section>
    </>
  )
}
