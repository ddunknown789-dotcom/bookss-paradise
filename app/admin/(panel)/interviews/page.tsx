import Link from 'next/link'

import PageHead, { ActionLink } from '@/components/admin/PageHead'
import RowDelete from '@/components/admin/RowDelete'
import { Badge, Empty } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { deleteInterview } from './actions'

export const metadata = { title: 'Interviews' }

export default async function InterviewsPage() {
  await requireRole('editor')
  const db = await adminDb()
  const { data } = await db
    .from('interviews')
    .select('id, slug, title, status, published_label, sort_order, author:authors(name), qa:interview_qa(count)')
    .order('sort_order')

  return (
    <>
      <PageHead
        title="Author Interviews"
        sub="Long-form Q&As. Each one gets its own page."
        actions={<ActionLink href="/admin/interviews/new" icon="plus" primary>New interview</ActionLink>}
      />
      <section className="ad-panel">
        {data?.length ? (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>Title</th><th>Questions</th><th>Date</th><th>Status</th><th /></tr></thead>
              <tbody>
                {data.map((i) => {
                  const row = i as unknown as {
                    id: string; slug: string; title: string; status: string; published_label: string | null
                    author: { name: string } | null; qa: { count: number }[]
                  }
                  return (
                    <tr key={row.id}>
                      <td>
                        <span className="ad-cell-title">
                          <b><Link href={`/admin/interviews/${row.id}`}>{row.title}</Link></b>
                          <span>{row.author?.name ?? 'No author'} · /{row.slug}</span>
                        </span>
                      </td>
                      <td className="ad-tight">{row.qa?.[0]?.count ?? 0}</td>
                      <td className="ad-tight ad-faint">{row.published_label ?? '—'}</td>
                      <td className="ad-tight"><Badge value={row.status} /></td>
                      <td className="ad-tight">
                        <div className="ad-row-actions">
                          <RowDelete
                            id={row.id}
                            action={deleteInterview}
                            title={`Delete “${row.title}”?`}
                            body="The interview and all its questions are removed."
                            editHref={`/admin/interviews/${row.id}`}
                            viewHref={row.status === 'published' ? `/interviews/${row.slug}` : undefined}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No interviews yet" body="Publish a Q&A with an author and it appears on the home page." action={<ActionLink href="/admin/interviews/new" icon="plus" primary>New interview</ActionLink>} />
        )}
      </section>
    </>
  )
}
