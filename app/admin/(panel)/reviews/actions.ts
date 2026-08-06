'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { bool, mutate, num, str, strOrNull, type ActionResult } from '@/lib/admin/actions'
import type { ReviewStatus } from '@/lib/supabase/database.types'

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<ActionResult> {
  const res = await mutate(
    async (db, actor) => {
      const { data, error } = await db
        .from('reviews')
        .update({
          status,
          approved_by: status === 'approved' ? actor.id : null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select('author_name')
        .single()
      if (error) throw error
      return data
    },
    {
      entity: 'reviews',
      action: 'update',
      entityId: id,
      summary: (d) => `${status === 'approved' ? 'Approved' : status === 'hidden' ? 'Hid' : 'Unapproved'} review by ${d.author_name}`,
      tags: [TAGS.reviews],
    },
  )
  if (res.ok) revalidatePath('/admin/reviews')
  return res
}

export async function saveReview(id: string | null, fd: FormData): Promise<ActionResult> {
  const body = str(fd, 'body')
  const author = str(fd, 'author_name')
  if (!body || !author) return { ok: false, error: 'A name and the review text are both needed.' }

  const payload = {
    book_id: strOrNull(fd, 'book_id'),
    author_name: author,
    author_email: strOrNull(fd, 'author_email'),
    rating: num(fd, 'rating'),
    title: strOrNull(fd, 'title'),
    body,
    featured: bool(fd, 'featured'),
    status: (str(fd, 'status') || 'pending') as ReviewStatus,
    source: 'editorial' as const,
  }

  const res = await mutate(
    async (db) => {
      if (id) {
        const { error } = await db.from('reviews').update(payload).eq('id', id)
        if (error) throw error
        return { id }
      }
      const { data, error } = await db.from('reviews').insert(payload).select('id').single()
      if (error) throw error
      return { id: data.id }
    },
    { entity: 'reviews', action: id ? 'update' : 'create', summary: `${id ? 'Updated' : 'Added'} review by ${author}`, tags: [TAGS.reviews] },
  )
  if (res.ok) revalidatePath('/admin/reviews')
  return res
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      const { error } = await db.from('reviews').delete().eq('id', id)
      if (error) throw error
      return null
    },
    { entity: 'reviews', action: 'delete', entityId: id, summary: 'Deleted a review', tags: [TAGS.reviews] },
  )
  if (res.ok) revalidatePath('/admin/reviews')
  return res
}
