import 'server-only'

import { mutate, slugify, type ActionResult } from './actions'
import type { Row } from '@/components/admin/CollectionEditor'
import type { UserRole } from '@/lib/supabase/database.types'

/**
 * Saves a whole small table in one go: rows the editor removed are deleted,
 * new ones inserted, the rest updated, and `sort_order` rewritten to match the
 * on-screen order. Used by categories, services, videos, menus and socials.
 */
export async function saveCollection(
  table: string,
  rows: Row[],
  opts: {
    /** Columns to persist; anything else on the row is ignored. */
    fields: string[]
    /** Extra columns forced onto every row (e.g. menu_id). */
    fixed?: Record<string, unknown>
    /** Only delete rows matching this filter — scopes a shared table. */
    scope?: Record<string, unknown>
    /** Columns that must be a slug; derived from `slugFrom` when blank. */
    slugField?: string
    slugFrom?: string
    /** Rows missing this field are dropped rather than saved half-empty. */
    requiredField?: string
    role?: UserRole
    entityLabel: string
    tags: string[]
  },
): Promise<ActionResult> {
  const clean = rows.filter((r) => !opts.requiredField || String(r[opts.requiredField] ?? '').trim())

  return mutate(
    async (db) => {
      // What's currently stored, within scope.
      let existingQuery = db.from(table as never).select('id')
      for (const [k, v] of Object.entries(opts.scope ?? {})) existingQuery = existingQuery.eq(k, v as never)
      const { data: existing } = await existingQuery
      const existingIds = new Set((existing ?? []).map((r) => (r as { id: string }).id))

      const keptIds = new Set(clean.map((r) => r.id).filter(Boolean) as string[])
      const toDelete = [...existingIds].filter((id) => !keptIds.has(id))
      if (toDelete.length) await db.from(table as never).delete().in('id', toDelete)

      for (const [i, row] of clean.entries()) {
        const payload: Record<string, unknown> = { ...opts.fixed, sort_order: i }
        for (const f of opts.fields) if (f in row) payload[f] = row[f]

        if (opts.slugField) {
          const raw = String(payload[opts.slugField] ?? '') || String(row[opts.slugFrom ?? ''] ?? '')
          payload[opts.slugField] = slugify(raw) || `item-${i + 1}`
        }

        if (row.id) {
          const { error } = await db.from(table as never).update(payload as never).eq('id', row.id)
          if (error) throw error
        } else {
          const { error } = await db.from(table as never).insert(payload as never)
          if (error) throw error
        }
      }

      return { count: clean.length }
    },
    {
      entity: table,
      action: 'update',
      role: opts.role ?? 'editor',
      summary: `Updated ${opts.entityLabel}`,
      tags: opts.tags,
    },
  )
}
