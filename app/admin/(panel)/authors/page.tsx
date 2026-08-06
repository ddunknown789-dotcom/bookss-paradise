import Link from 'next/link'

import PageHead, { ActionLink } from '@/components/admin/PageHead'
import RowDelete from '@/components/admin/RowDelete'
import { Badge, Empty } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { SUPABASE_URL } from '@/lib/supabase/env'
import { deleteAuthor } from './actions'

export const metadata = { title: 'Authors' }

export default async function AuthorsPage() {
  await requireRole('editor')
  const db = await adminDb()
  const { data: authors } = await db
    .from('authors')
    .select('id, name, slug, status, sort_order, photo:media!authors_photo_id_fkey(path), books:books(count)')
    .order('sort_order')
    .order('name')

  return (
    <>
      <PageHead
        title="Authors"
        sub="The writers behind the books. Each one can have a photo, bio and social links."
        actions={<ActionLink href="/admin/authors/new" icon="plus" primary>New author</ActionLink>}
      />

      <section className="ad-panel">
        {authors?.length ? (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr><th>Name</th><th>Books</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {authors.map((a) => {
                  const row = a as unknown as {
                    id: string; name: string; slug: string; status: string
                    photo: { path: string } | null; books: { count: number }[]
                  }
                  const bookCount = row.books?.[0]?.count ?? 0
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="ad-cell-main">
                          {row.photo?.path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={`${SUPABASE_URL}/storage/v1/object/public/media/${row.photo.path}`} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
                          ) : (
                            <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#eee9de', flex: '0 0 auto' }} />
                          )}
                          <span className="ad-cell-title">
                            <b><Link href={`/admin/authors/${row.id}`}>{row.name}</Link></b>
                            <span>/{row.slug}</span>
                          </span>
                        </div>
                      </td>
                      <td className="ad-tight">{bookCount}</td>
                      <td className="ad-tight"><Badge value={row.status} /></td>
                      <td className="ad-tight">
                        <div className="ad-row-actions">
                          <RowDelete
                            id={row.id}
                            action={deleteAuthor}
                            title={`Delete ${row.name}?`}
                            body={bookCount ? `${bookCount} book${bookCount === 1 ? ' is' : 's are'} credited to them — you'll need to reassign those first.` : 'This author has no books attached.'}
                            editHref={`/admin/authors/${row.id}`}
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
          <Empty title="No authors yet" body="Add an author, then credit books to them." action={<ActionLink href="/admin/authors/new" icon="plus" primary>New author</ActionLink>} />
        )}
      </section>
    </>
  )
}
