'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { saveCollection } from '@/lib/admin/collection'
import type { Row } from '@/components/admin/CollectionEditor'
import type { ActionResult } from '@/lib/admin/actions'

export async function saveCategories(rows: Row[]): Promise<ActionResult> {
  const res = await saveCollection('categories', rows, {
    fields: ['name', 'slug', 'type', 'visible'],
    slugField: 'slug',
    slugFrom: 'name',
    requiredField: 'name',
    entityLabel: 'categories',
    tags: [TAGS.categories, TAGS.books],
  })
  if (res.ok) revalidatePath('/admin/categories')
  return res
}
