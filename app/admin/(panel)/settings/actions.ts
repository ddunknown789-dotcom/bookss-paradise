'use server'

import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import { mutate, type ActionResult } from '@/lib/admin/actions'

/**
 * Saves one group of settings. `__keys` lists every field the form owns, so an
 * unchecked toggle is written as `false` rather than silently skipped.
 */
export async function saveSettingsGroup(group: string, fd: FormData): Promise<ActionResult> {
  const spec = String(fd.get('__keys') ?? '')
    .split(',')
    .filter(Boolean)
    .map((pair) => {
      const [key, type] = pair.split(':')
      return { key, type }
    })

  const res = await mutate(
    async (db, actor) => {
      for (const { key, type } of spec) {
        const value = type === 'toggle' ? fd.get(key) === 'on' : String(fd.get(key) ?? '')
        const { error } = await db
          .from('settings')
          .upsert({ key, group_name: group, value: value as never, updated_by: actor.id }, { onConflict: 'key' })
        if (error) throw error
      }
      return { count: spec.length }
    },
    {
      entity: 'settings',
      action: 'settings',
      role: 'admin',
      summary: `Updated ${group} settings`,
      tags: [TAGS.settings, TAGS.sections],
    },
  )

  if (res.ok) {
    revalidatePath('/admin/settings')
    revalidatePath('/admin/footer')
  }
  return res
}
