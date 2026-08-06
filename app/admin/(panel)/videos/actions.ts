'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { saveCollection } from '@/lib/admin/collection'
import type { Row } from '@/components/admin/CollectionEditor'
import type { ActionResult } from '@/lib/admin/actions'

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
