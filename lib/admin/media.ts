import 'server-only'

import { adminDb } from './actions'
import { SUPABASE_URL } from '@/lib/supabase/env'
import type { Folder, MediaItem } from '@/components/admin/MediaBrowser'

/**
 * Everything the media library and every media picker needs, in one call.
 * Pickers are used on most edit screens, so this is loaded once per page and
 * passed down rather than fetched per field.
 */
export async function loadMediaLibrary(): Promise<{
  items: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
}> {
  const db = await adminDb()

  const [{ data: items }, { data: folders }] = await Promise.all([
    db
      .from('media')
      .select('id, path, filename, kind, mime_type, size_bytes, width, height, alt_text, caption, folder_id, created_at')
      .order('created_at', { ascending: false })
      .limit(1000),
    db.from('media_folders').select('id, name, slug').order('name'),
  ])

  return {
    items: (items ?? []) as MediaItem[],
    folders: (folders ?? []) as Folder[],
    supabaseUrl: SUPABASE_URL,
  }
}

export const findMedia = (items: MediaItem[], id: string | null | undefined): MediaItem | null =>
  id ? items.find((m) => m.id === id) ?? null : null
