'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { int, json, mutate, str, strOrNull, uniqueSlug, type ActionResult } from '@/lib/admin/actions'
import type { ContentStatus } from '@/lib/supabase/database.types'

export type QA = { question: string; answer: string }

export async function saveInterview(id: string | null, fd: FormData): Promise<ActionResult> {
  const title = str(fd, 'title')
  if (!title) return { ok: false, error: 'Give the interview a title.' }
  const slug = await uniqueSlug('interviews', str(fd, 'slug') || title, id)

  const fields = {
    slug,
    title,
    book_id: strOrNull(fd, 'book_id'),
    author_id: strOrNull(fd, 'author_id'),
    image_id: strOrNull(fd, 'image_id'),
    intro: strOrNull(fd, 'intro'),
    minutes: strOrNull(fd, 'minutes'),
    published_label: strOrNull(fd, 'published_label'),
    published_on: strOrNull(fd, 'published_on'),
    status: (str(fd, 'status') || 'draft') as ContentStatus,
    sort_order: int(fd, 'sort_order', 0),
  }

  const res = await mutate(
    async (db, actor) => {
      let interviewId = id
      if (id) {
        const { error } = await db.from('interviews').update(fields).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await db.from('interviews').insert({ ...fields, created_by: actor.id }).select('id').single()
        if (error) throw error
        interviewId = data.id
      }

      await db.from('interview_qa').delete().eq('interview_id', interviewId!)
      const qa = json<QA[]>(fd, 'qa', []).filter((x) => x.question?.trim() && x.answer?.trim())
      if (qa.length) {
        await db.from('interview_qa').insert(
          qa.map((x, i) => ({ interview_id: interviewId!, question: x.question, answer: x.answer, sort_order: i })),
        )
      }
      return { id: interviewId! }
    },
    {
      entity: 'interviews',
      action: id ? 'update' : 'create',
      entityId: (d) => d.id,
      summary: `${id ? 'Updated' : 'Added'} interview “${title}”`,
      tags: [TAGS.interviews, TAGS.sections],
    },
  )

  if (!res.ok) return res
  revalidatePath('/admin/interviews')
  if (!id) redirect(`/admin/interviews/${(res.data as { id: string }).id}`)
  return res
}

export async function deleteInterview(id: string): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      const { data } = await db.from('interviews').select('title').eq('id', id).single()
      await db.from('seo_meta').delete().eq('entity_type', 'interview').eq('entity_id', id)
      const { error } = await db.from('interviews').delete().eq('id', id)
      if (error) throw error
      return data ?? { title: 'an interview' }
    },
    { entity: 'interviews', action: 'delete', entityId: id, summary: (d) => `Deleted “${d.title}”`, tags: [TAGS.interviews, TAGS.sections] },
  )
  if (res.ok) revalidatePath('/admin/interviews')
  return res
}
