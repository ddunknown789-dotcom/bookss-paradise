'use server'

import { revalidatePath } from 'next/cache'

import { assertRole } from '@/lib/auth'
import { bool, mutate, str, type ActionResult } from '@/lib/admin/actions'
import type { UserRole } from '@/lib/supabase/database.types'

/**
 * Role changes are the most sensitive write in the panel, so they are guarded
 * three ways: only admins reach the action, only an owner may grant or revoke
 * `owner`, and nobody can change or deactivate their own account (which is how
 * people lock themselves out).
 */
export async function updateTeamMember(id: string, fd: FormData): Promise<ActionResult> {
  const me = await assertRole('admin')
  const role = str(fd, 'role') as UserRole
  const active = bool(fd, 'is_active')

  if (id === me.id) return { ok: false, error: 'You can’t change your own role or status.' }
  if (role === 'owner' && me.profile.role !== 'owner') {
    return { ok: false, error: 'Only an owner can make someone else an owner.' }
  }

  const res = await mutate(
    async (db) => {
      const { data: target } = await db.from('profiles').select('role, email').eq('id', id).single()
      if (target?.role === 'owner' && me.profile.role !== 'owner') {
        throw new Error('Only an owner can change another owner.')
      }
      const { error } = await db
        .from('profiles')
        .update({ role, is_active: active, full_name: str(fd, 'full_name') || null })
        .eq('id', id)
      if (error) throw error
      return target ?? { email: 'a user' }
    },
    {
      entity: 'profiles',
      action: 'update',
      role: 'admin',
      entityId: id,
      summary: (d) => `Set ${d.email} to ${role}${active ? '' : ' (deactivated)'}`,
      tags: [],
    },
  )
  if (res.ok) revalidatePath('/admin/users')
  return res
}
