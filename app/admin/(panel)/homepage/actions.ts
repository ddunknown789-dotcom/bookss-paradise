'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { mutate, type ActionResult } from '@/lib/admin/actions'
import { SECTION_LABELS } from '@/lib/cms/sections'
import type { SectionType } from '@/lib/supabase/database.types'

/** Persist the on-screen order and the visible flags in one write. */
export async function saveSectionLayout(
  rows: { id: string; visible: boolean }[],
): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      for (const [i, row] of rows.entries()) {
        const { error } = await db
          .from('page_sections')
          .update({ sort_order: i, visible: row.visible })
          .eq('id', row.id)
        if (error) throw error
      }
      return null
    },
    { entity: 'page_sections', action: 'reorder', summary: 'Reordered the home page', tags: [TAGS.sections] },
  )
  if (res.ok) revalidatePath('/admin/homepage')
  return res
}

/** Save one section's editable content. */
export async function saveSectionContent(
  id: string,
  type: SectionType,
  content: Record<string, unknown>,
): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      const { error } = await db.from('page_sections').update({ content: content as never }).eq('id', id)
      if (error) throw error
      return null
    },
    {
      entity: 'page_sections',
      action: 'update',
      entityId: id,
      summary: `Edited the ${SECTION_LABELS[type]} section`,
      tags: [TAGS.sections],
    },
  )
  if (res.ok) revalidatePath('/admin/homepage')
  return res
}
