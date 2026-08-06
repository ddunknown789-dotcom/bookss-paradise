'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertRole } from '@/lib/auth'
import { revalidate, TAGS } from '@/lib/cms/cache'
import { mutate, fail, ok, slugify, str, strOrNull, type ActionResult } from '@/lib/admin/actions'

/* ============================================================================
   Media library actions.

   Files upload straight from the browser to Supabase Storage using the
   signed-in user's own token — RLS on storage.objects is what permits it, and
   it keeps large video files from round-tripping through the Next.js server.
   These actions handle the database side and deletion.
   ========================================================================== */

export type MediaKindValue = 'image' | 'video' | 'pdf' | 'audio' | 'other'

export async function kindFor(mime: string): Promise<MediaKindValue> {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime === 'application/pdf') return 'pdf'
  return 'other'
}

/** Records a file the browser has just pushed into Storage. */
export async function registerMedia(input: {
  path: string
  filename: string
  mimeType: string
  size: number
  width?: number | null
  height?: number | null
  folderId?: string | null
}): Promise<ActionResult<{ id: string }>> {
  return mutate(
    async (db, actor) => {
      const { data, error } = await db
        .from('media')
        .upsert(
          {
            bucket: 'media',
            path: input.path,
            filename: input.filename,
            original_name: input.filename,
            mime_type: input.mimeType,
            kind: await kindFor(input.mimeType),
            size_bytes: input.size,
            width: input.width ?? null,
            height: input.height ?? null,
            folder_id: input.folderId ?? null,
            uploaded_by: actor.id,
          },
          { onConflict: 'bucket,path' },
        )
        .select('id')
        .single()
      if (error) throw error
      return { id: data.id }
    },
    { entity: 'media', action: 'upload', summary: `Uploaded ${input.filename}`, tags: [TAGS.media] },
  )
}

/** A storage path that won't collide with anything already there. */
export async function reservePath(folderId: string | null, filename: string): Promise<string> {
  await assertRole('editor')
  const db = createAdminClient()

  let prefix = ''
  if (folderId) {
    const { data } = await db.from('media_folders').select('slug').eq('id', folderId).maybeSingle()
    if (data?.slug) prefix = `${data.slug}/`
  }

  const dot = filename.lastIndexOf('.')
  const stem = slugify(dot > 0 ? filename.slice(0, dot) : filename) || 'file'
  const ext = dot > 0 ? filename.slice(dot).toLowerCase() : ''

  let candidate = `${prefix}${stem}${ext}`
  for (let n = 2; n < 500; n++) {
    const { data } = await db.from('media').select('id').eq('path', candidate).limit(1)
    if (!data?.length) return candidate
    candidate = `${prefix}${stem}-${n}${ext}`
  }
  return `${prefix}${stem}-${Date.now()}${ext}`
}

export async function updateMedia(id: string, form: FormData): Promise<ActionResult> {
  return mutate(
    async (db) => {
      const { error } = await db
        .from('media')
        .update({
          filename: str(form, 'filename') || 'untitled',
          alt_text: strOrNull(form, 'alt_text'),
          caption: strOrNull(form, 'caption'),
          folder_id: strOrNull(form, 'folder_id'),
        })
        .eq('id', id)
      if (error) throw error
      return null
    },
    { entity: 'media', action: 'update', entityId: id, summary: `Updated ${str(form, 'filename')}`, tags: [TAGS.media] },
  )
}

/**
 * Deletes files, refusing when something on the site still points at one —
 * a silently broken cover is much worse than a blocked delete.
 */
export async function deleteMedia(ids: string[]): Promise<ActionResult<{ deleted: number }>> {
  if (!ids.length) return fail('Nothing selected.')

  let actor
  try {
    actor = await assertRole('editor')
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Not allowed.')
  }

  const db = createAdminClient()

  // Every column that can hold a media id.
  const REFS: [string, string][] = [
    ['books', 'cover_id'], ['books', 'cover_3d_id'], ['books', 'about_image_id'], ['books', 'trailer_media_id'],
    ['authors', 'photo_id'], ['interviews', 'image_id'], ['week_books', 'cover_id'],
    ['videos', 'thumb_id'], ['videos', 'media_id'], ['book_media', 'media_id'],
    ['book_videos', 'thumb_id'], ['book_videos', 'media_id'],
    ['categories', 'image_id'], ['reviews', 'avatar_id'], ['seo_meta', 'og_image_id'],
  ]

  const inUse = new Set<string>()
  for (const [table, column] of REFS) {
    const { data } = await db.from(table as never).select(column).in(column, ids)
    for (const row of (data ?? []) as unknown as Record<string, string | null>[]) {
      const v = row[column]
      if (v) inUse.add(v)
    }
  }

  const safe = ids.filter((id) => !inUse.has(id))
  if (!safe.length) {
    return fail(
      ids.length === 1
        ? 'That file is still used on the site. Replace it where it’s used, then delete it.'
        : 'All the selected files are still in use on the site.',
    )
  }

  const { data: rows } = await db.from('media').select('path').in('id', safe)
  const paths = (rows ?? []).map((r) => r.path).filter(Boolean)
  if (paths.length) await db.storage.from('media').remove(paths)

  const { error } = await db.from('media').delete().in('id', safe)
  if (error) return fail(error.message)

  await db.from('audit_log').insert({
    actor_id: actor.id,
    actor_email: actor.email,
    action: 'delete',
    entity: 'media',
    summary: `Deleted ${safe.length} file${safe.length === 1 ? '' : 's'}`,
  })
  revalidate(TAGS.media)

  return ok(
    { deleted: safe.length },
    inUse.size ? `Deleted ${safe.length}. ${inUse.size} kept — still in use on the site.` : undefined,
  )
}

export async function createFolder(name: string): Promise<ActionResult<{ id: string }>> {
  const clean = name.trim()
  if (!clean) return fail('Give the folder a name.')
  return mutate(
    async (db) => {
      const { data, error } = await db
        .from('media_folders')
        .insert({ name: clean, slug: slugify(clean) || 'folder' })
        .select('id')
        .single()
      if (error) throw error
      return { id: data.id }
    },
    { entity: 'media_folders', action: 'create', summary: `Created folder “${clean}”`, tags: [TAGS.media] },
  )
}

export async function deleteFolder(id: string): Promise<ActionResult> {
  return mutate(
    async (db) => {
      // Files survive; they just move back to the top level.
      await db.from('media').update({ folder_id: null }).eq('folder_id', id)
      const { error } = await db.from('media_folders').delete().eq('id', id)
      if (error) throw error
      return null
    },
    { entity: 'media_folders', action: 'delete', entityId: id, summary: 'Deleted a folder', tags: [TAGS.media] },
  )
}
