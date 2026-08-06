import { notFound } from 'next/navigation'

import PageHead from '@/components/admin/PageHead'
import InterviewForm from '@/components/admin/InterviewForm'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { loadMediaLibrary, findMedia } from '@/lib/admin/media'
import { saveInterview, type QA } from '../actions'

export const metadata = { title: 'Edit interview' }

export default async function InterviewEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('editor')
  const { id } = await params
  const isNew = id === 'new'

  const db = await adminDb()
  const [{ items: media, folders, supabaseUrl }, { data: books }, { data: authors }] = await Promise.all([
    loadMediaLibrary(),
    db.from('books').select('id, title').order('title'),
    db.from('authors').select('id, name').order('name'),
  ])

  let iv: Record<string, any> = {
    title: '', slug: '', book_id: '', author_id: '', image_id: '', intro: '',
    minutes: '', published_label: '', published_on: '', status: 'draft', sort_order: 0,
  }
  let qa: QA[] = []

  if (!isNew) {
    const { data } = await db
      .from('interviews')
      .select('*, qa:interview_qa(question, answer, sort_order)')
      .eq('id', id)
      .maybeSingle()
    if (!data) notFound()
    iv = data as Record<string, any>
    qa = [...(iv.qa ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((x: any) => ({ question: x.question, answer: x.answer }))
  }

  async function save(fd: FormData) {
    'use server'
    return saveInterview(isNew ? null : id, fd)
  }

  return (
    <>
      <PageHead
        title={isNew ? 'New interview' : iv.title}
        back={{ href: '/admin/interviews', label: 'Interviews' }}
      />
      <InterviewForm
        data={{
          title: iv.title ?? '',
          slug: iv.slug ?? '',
          book_id: iv.book_id ?? '',
          author_id: iv.author_id ?? '',
          image_id: iv.image_id ?? '',
          intro: iv.intro ?? '',
          minutes: iv.minutes ?? '',
          published_label: iv.published_label ?? '',
          published_on: iv.published_on ?? '',
          status: iv.status ?? 'draft',
          sort_order: String(iv.sort_order ?? 0),
          qa,
        }}
        image={findMedia(media, iv.image_id)}
        books={books ?? []}
        authors={authors ?? []}
        media={media}
        folders={folders}
        supabaseUrl={supabaseUrl}
        onSave={save}
      />
    </>
  )
}
