'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { saveCollection } from '@/lib/admin/collection'
import type { Row } from '@/components/admin/CollectionEditor'
import type { ActionResult } from '@/lib/admin/actions'

export async function saveServices(rows: Row[]): Promise<ActionResult> {
  // `title_lines` is edited as one textarea; the site renders one line per row.
  const prepared = rows.map((r) => ({
    ...r,
    title_lines: String(r.title_lines_text ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
  }))

  const res = await saveCollection('services', prepared, {
    fields: ['key', 'glyph', 'title_lines', 'description', 'visible'],
    slugField: 'key',
    slugFrom: 'description',
    requiredField: 'title_lines_text',
    entityLabel: 'the What We Offer cards',
    tags: [TAGS.services, TAGS.sections],
  })
  if (res.ok) revalidatePath('/admin/services')
  return res
}
