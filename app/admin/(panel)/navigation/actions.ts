'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { saveCollection } from '@/lib/admin/collection'
import type { Row } from '@/components/admin/CollectionEditor'
import type { ActionResult } from '@/lib/admin/actions'
import { adminDb } from '@/lib/admin/actions'

/** Menus are shared in one table, so each save is scoped to its own menu_id. */
export async function saveMenu(menuKey: string, rows: Row[]): Promise<ActionResult> {
  const db = await adminDb()
  const { data: menu } = await db.from('menus').select('id').eq('key', menuKey).maybeSingle()
  if (!menu) return { ok: false, error: `Menu “${menuKey}” doesn’t exist.` }

  const res = await saveCollection('menu_items', rows, {
    fields: ['label', 'href', 'target', 'visible'],
    fixed: { menu_id: menu.id },
    scope: { menu_id: menu.id },
    requiredField: 'label',
    role: 'admin',
    entityLabel: `the ${menuKey.replace(/_/g, ' ')} menu`,
    tags: [TAGS.menus],
  })
  if (res.ok) {
    revalidatePath('/admin/navigation')
    revalidatePath('/admin/footer')
  }
  return res
}

export async function savePrimaryMenu(rows: Row[]) { return saveMenu('primary', rows) }
export async function saveFooterPages(rows: Row[]) { return saveMenu('footer_pages', rows) }
export async function saveFooterExplore(rows: Row[]) { return saveMenu('footer_explore', rows) }

export async function saveSocialLinks(rows: Row[]): Promise<ActionResult> {
  const res = await saveCollection('social_links', rows, {
    fields: ['platform', 'label', 'url', 'icon', 'visible'],
    requiredField: 'url',
    role: 'admin',
    entityLabel: 'social links',
    tags: [TAGS.social],
  })
  if (res.ok) revalidatePath('/admin/footer')
  return res
}
