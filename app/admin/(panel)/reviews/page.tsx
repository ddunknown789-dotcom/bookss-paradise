import Link from 'next/link'

import PageHead from '@/components/admin/PageHead'
import ReviewCard from '@/components/admin/ReviewCard'
import { Empty } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'

export const metadata = { title: 'Reviews' }

const TABS = ['pending', 'approved', 'hidden', 'all'] as const

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole('editor')
  const { status = 'pending' } = await searchParams
  const db = await adminDb()

  let q = db
    .from('reviews')
    .select('id, author_name, author_email, rating, title, body, status, source, featured, created_at, book:books(id, title, slug)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (status !== 'all') q = q.eq('status', status as never)

  const { data: reviews } = await q
  const { data: all } = await db.from('reviews').select('status')
  const tally = (s: string) => (all ?? []).filter((r) => r.status === s).length

  return (
    <>
      <PageHead
        title="Reviews"
        sub="Reader reviews arrive here for approval. Nothing appears on the site until you approve it."
      />

      <section className="ad-panel">
        <div className="ad-panel-head">
          <div className="ad-tabs" style={{ border: 'none', margin: 0 }}>
            {TABS.map((s) => (
              <Link key={s} href={`/admin/reviews?status=${s}`} className={`ad-tab ${status === s ? 'is-active' : ''}`}>
                {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
                {s !== 'all' && <span className="ad-faint"> ({tally(s)})</span>}
              </Link>
            ))}
          </div>
        </div>

        <div className="ad-panel-body">
          {reviews?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r as never} />
              ))}
            </div>
          ) : (
            <Empty
              title={status === 'pending' ? 'Nothing waiting' : 'No reviews here'}
              body={
                status === 'pending'
                  ? 'New reader reviews will appear here for you to approve or hide.'
                  : 'Try another tab.'
              }
            />
          )}
        </div>
      </section>
    </>
  )
}
