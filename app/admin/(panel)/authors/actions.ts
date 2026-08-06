'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { bool, int, mutate, str, strOrNull, uniqueSlug, type ActionResult } from '@/lib/admin/actions'
import type { ContentStatus } from '@/lib/supabase/database.types'

const fields = (fd: FormData, slug: string) => ({
  slug,
  name: str(fd, 'name'),
  bio: strOrNull(fd, 'bio'),
  photo_id: strOrNull(fd, 'photo_id'),
  website: strOrNull(fd, 'website'),
  socials: {
    instagram: strOrNull(fd, 'instagram'),
    twitter: strOrNull(fd, 'twitter'),
    facebook: strOrNull(fd, 'facebook'),
    goodreads: strOrNull(fd, 'goodreads'),
  } as never,
  status: (str(fd, 'status') || 'published') as ContentStatus,
  sort_order: int(fd, 'sort_order', 0),
})

export async function saveAuthor(id: string | null, fd: FormData): Promise<ActionResult> {
  const name = str(fd, 'name')
  if (!name) return { ok: false, error: 'Give the author a name.' }
  const slug = await uniqueSlug('authors', str(fd, 'slug') || name, id)

  const res = await mutate(
    async (db, actor) => {
      if (id) {
        const { error } = await db.from('authors').update(fields(fd, slug)).eq('id', id)
        if (error) throw error
        return { id }
      }
      const { data, error } = await db
        .from('authors')
        .insert({ ...fields(fd, slug), created_by: actor.id })
        .select('id')
        .single()
      if (error) throw error
      return { id: data.id }
    },
    {
      entity: 'authors',
      action: id ? 'update' : 'create',
      entityId: (d) => d.id,
      summary: `${id ? 'Updated' : 'Added'} author “${name}”`,
      tags: [TAGS.authors, TAGS.books],
    },
  )

  if (!res.ok) return res
  revalidatePath('/admin/authors')
  if (!id) redirect(`/admin/authors/${(res.data as { id: string }).id}`)
  return res
}

export async function deleteAuthor(id: string): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      const { count } = await db.from('books').select('*', { head: true, count: 'exact' }).eq('author_id', id)
      if (count) {
        throw new Error(
          `${count} book${count === 1 ? '' : 's'} still credited to this author. Reassign them first.`,
        )
      }
      const { data } = await db.from('authors').select('name').eq('id', id).single()
      const { error } = await db.from('authors').delete().eq('id', id)
      if (error) throw error
      return data ?? { name: 'an author' }
    },
    { entity: 'authors', action: 'delete', entityId: id, summary: (d) => `Deleted author “${d.name}”`, tags: [TAGS.authors] },
  )
  if (res.ok) revalidatePath('/admin/authors')
  return res
}
