'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { saveCollection } from '@/lib/admin/collection'
import type { Row } from '@/components/admin/CollectionEditor'
import type { ActionResult } from '@/lib/admin/actions'
import { WATCH_PAGES, type WatchCategory } from '@/lib/video'

export async function saveVideos(rows: Row[]): Promise<ActionResult> {
  const res = await saveCollection('videos', rows, {
    fields: ['key', 'icon', 'screen_label', 'title', 'description', 'cta_label', 'cta_href', 'video_url', 'status'],
    slugField: 'key',
    slugFrom: 'title',
    requiredField: 'title',
    entityLabel: 'the video content cards',
    tags: [TAGS.videos, TAGS.sections],
  })
  if (res.ok) revalidatePath('/admin/videos')
  return res
}

const GALLERY_FIELDS = [
  'title', 'description', 'duration', 'published_at',
  'video_url', 'media_id', 'poster_id', 'poster_url', 'aspect', 'status',
]

/**
 * Save one gallery.
 *
 * Scoped to its own category, so saving the trailers does not touch — or
 * delete — the reviews sitting in the same table.
 *
 * The empty strings a browser form produces are turned back into nulls first:
 * a cleared date or an unpicked file is "not set", and Postgres will not take
 * '' for either a `date` or a `uuid`.
 */
async function saveGallery(category: WatchCategory, rows: Row[]): Promise<ActionResult> {
  const cleaned = rows.map((row) => ({
    ...row,
    published_at: row.published_at || null,
    media_id: row.media_id || null,
    poster_id: row.poster_id || null,
  }))

  const res = await saveCollection('video_items', cleaned, {
    fields: GALLERY_FIELDS,
    fixed: { category },
    scope: { category },
    requiredField: 'title',
    entityLabel: `the ${WATCH_PAGES[category].kicker.toLowerCase()}`,
    tags: [TAGS.videoItems],
  })
  if (res.ok) revalidatePath('/admin/videos')
  return res
}

/* One action per gallery: a 'use server' module may only export functions, and
   each editor on the page needs its own. */
export async function saveReviewVideos(rows: Row[]): Promise<ActionResult> {
  return saveGallery('review', rows)
}

export async function saveSummaryVideos(rows: Row[]): Promise<ActionResult> {
  return saveGallery('summary', rows)
}

export async function saveTrailerVideos(rows: Row[]): Promise<ActionResult> {
  return saveGallery('trailer', rows)
}
