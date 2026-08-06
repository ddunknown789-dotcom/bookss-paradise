'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { bool, csv, mutate, str, strOrNull, type ActionResult } from '@/lib/admin/actions'
import type { SeoEntity } from '@/lib/supabase/database.types'

export async function saveSeo(entityType: SeoEntity, entityId: string | null, fd: FormData): Promise<ActionResult> {
  const payload = {
    entity_type: entityType,
    entity_id: entityId,
    title: strOrNull(fd, 'title'),
    description: strOrNull(fd, 'description'),
    canonical_url: strOrNull(fd, 'canonical_url'),
    robots_noindex: bool(fd, 'robots_noindex'),
    robots_nofollow: bool(fd, 'robots_nofollow'),
    og_title: strOrNull(fd, 'og_title'),
    og_description: strOrNull(fd, 'og_description'),
    og_image_id: strOrNull(fd, 'og_image_id'),
    twitter_card: str(fd, 'twitter_card') || 'summary_large_image',
    twitter_site: strOrNull(fd, 'twitter_site'),
    twitter_creator: strOrNull(fd, 'twitter_creator'),
    keywords: csv(fd, 'keywords'),
  }

  const res = await mutate(
    async (db) => {
      let q = db.from('seo_meta').delete().eq('entity_type', entityType)
      q = entityId ? q.eq('entity_id', entityId) : q.is('entity_id', null)
      await q
      const { error } = await db.from('seo_meta').insert(payload)
      if (error) throw error
      return null
    },
    { entity: 'seo_meta', action: 'update', role: 'admin', summary: 'Updated SEO settings', tags: [TAGS.seo] },
  )
  if (res.ok) revalidatePath('/admin/seo')
  return res
}

export async function saveGlobalSeo(fd: FormData) { return saveSeo('global', null, fd) }
