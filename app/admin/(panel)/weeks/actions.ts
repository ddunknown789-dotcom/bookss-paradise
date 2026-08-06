'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { json, mutate, slugify, str, strOrNull, type ActionResult } from '@/lib/admin/actions'
import type { ContentStatus } from '@/lib/supabase/database.types'

export type WeekPick = {
  id?: string
  book_id: string
  title: string
  author: string
  genre: string
  pages: string
  published_label: string
  cover_id: string
}

export async function saveWeek(id: string | null, fd: FormData): Promise<ActionResult> {
  const label = str(fd, 'label')
  if (!label) return { ok: false, error: 'Give the week a label, like “This Week”.' }

  const fields = {
    key: slugify(str(fd, 'key') || label) || `week-${Date.now()}`,
    label,
    range_label: strOrNull(fd, 'range_label'),
    status: (str(fd, 'status') || 'published') as ContentStatus,
  }

  const res = await mutate(
    async (db) => {
      let weekId = id
      if (id) {
        const { error } = await db.from('weeks').update(fields).eq('id', id)
        if (error) throw error
      } else {
        // A new week goes to the top — it's the one the home page shows.
        const { data: first } = await db.from('weeks').select('sort_order').order('sort_order').limit(1).maybeSingle()
        const { data, error } = await db
          .from('weeks')
          .insert({ ...fields, sort_order: (first?.sort_order ?? 0) - 1 })
          .select('id')
          .single()
        if (error) throw error
        weekId = data.id
      }

      await db.from('week_books').delete().eq('week_id', weekId!)
      const picks = json<WeekPick[]>(fd, 'picks', []).filter((p) => p.title?.trim())
      if (picks.length) {
        await db.from('week_books').insert(
          picks.map((p, i) => ({
            week_id: weekId!,
            book_id: p.book_id || null,
            title: p.title,
            author: p.author || null,
            genre: p.genre || null,
            pages: p.pages ? Number(p.pages) : null,
            published_label: p.published_label || null,
            cover_id: p.cover_id || null,
            sort_order: i,
          })),
        )
      }
      return { id: weekId! }
    },
    { entity: 'weeks', action: id ? 'update' : 'create', summary: `${id ? 'Updated' : 'Added'} “${label}”`, tags: [TAGS.weeks, TAGS.sections] },
  )
  if (res.ok) revalidatePath('/admin/weeks')
  return res
}

export async function deleteWeek(id: string): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      const { data } = await db.from('weeks').select('label').eq('id', id).single()
      const { error } = await db.from('weeks').delete().eq('id', id)
      if (error) throw error
      return data ?? { label: 'a week' }
    },
    { entity: 'weeks', action: 'delete', entityId: id, summary: (d) => `Deleted “${d.label}”`, tags: [TAGS.weeks, TAGS.sections] },
  )
  if (res.ok) revalidatePath('/admin/weeks')
  return res
}

export async function reorderWeeks(ids: string[]): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      for (const [i, id] of ids.entries()) await db.from('weeks').update({ sort_order: i }).eq('id', id)
      return null
    },
    { entity: 'weeks', action: 'reorder', summary: 'Reordered the weeks', tags: [TAGS.weeks, TAGS.sections] },
  )
  if (res.ok) revalidatePath('/admin/weeks')
  return res
}
