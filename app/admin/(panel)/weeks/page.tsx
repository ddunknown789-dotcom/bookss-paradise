import PageHead from '@/components/admin/PageHead'
import WeeksEditor from '@/components/admin/WeeksEditor'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { loadMediaLibrary } from '@/lib/admin/media'

export const metadata = { title: 'Book of the Week' }

export default async function WeeksPage() {
  await requireRole('editor')
  const db = await adminDb()
  const [{ items: media, folders, supabaseUrl }, { data: weeks }, { data: books }] = await Promise.all([
    loadMediaLibrary(),
    db
      .from('weeks')
      .select('id, key, label, range_label, status, sort_order, books:week_books(id, book_id, title, author, genre, pages, published_label, cover_id, sort_order)')
      .order('sort_order'),
    db.from('books').select('id, title').order('title'),
  ])

  const rows = (weeks ?? []).map((w) => {
    const week = w as Record<string, any>
    return {
      id: week.id,
      key: week.key,
      label: week.label,
      range_label: week.range_label ?? '',
      status: week.status,
      picks: [...(week.books ?? [])]
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((p: any) => ({
          id: p.id,
          book_id: p.book_id ?? '',
          title: p.title,
          author: p.author ?? '',
          genre: p.genre ?? '',
          pages: p.pages?.toString() ?? '',
          published_label: p.published_label ?? '',
          cover_id: p.cover_id ?? '',
        })),
    }
  })

  return (
    <>
      <PageHead
        title="Book of the Week"
        sub="The first week in this list is the one shown on the home page. Older weeks stay in the archive."
      />
      <WeeksEditor weeks={rows} books={books ?? []} media={media} folders={folders} supabaseUrl={supabaseUrl} />
    </>
  )
}
