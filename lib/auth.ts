import 'server-only'

import { redirect } from 'next/navigation'

import { createClient } from './supabase/server'
import type { Profile, UserRole } from './supabase/database.types'
import { isConfigured } from './supabase/env'

/** owner > admin > editor. Used for every "may this person…" check. */
export const ROLE_RANK: Record<UserRole, number> = { owner: 3, admin: 2, editor: 1 }

export function atLeast(role: UserRole | null | undefined, min: UserRole): boolean {
  if (!role) return false
  return ROLE_RANK[role] >= ROLE_RANK[min]
}

export type SessionUser = {
  id: string
  email: string
  profile: Profile
}

/** The signed-in staff member, or null. Never throws. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isConfigured) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !profile.is_active) return null

  return { id: user.id, email: user.email ?? profile.email, profile }
}

/**
 * Gate a page or server action. Redirects to the login screen when signed out,
 * and to the dashboard when signed in without enough privilege — so a missing
 * permission never looks like a broken link.
 */
export async function requireRole(min: UserRole = 'editor'): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')
  if (!atLeast(user.profile.role, min)) redirect('/admin?denied=1')
  return user
}

/** Same check for server actions, which should fail loudly rather than redirect. */
export async function assertRole(min: UserRole = 'editor'): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new Error('Not signed in.')
  if (!atLeast(user.profile.role, min)) {
    throw new Error(`This action needs the ${min} role or higher.`)
  }
  return user
}

/** What each role is allowed to reach in the admin panel. */
export const PERMISSIONS = {
  books: 'editor',
  authors: 'editor',
  reviews: 'editor',
  videos: 'editor',
  interviews: 'editor',
  weeks: 'editor',
  media: 'editor',
  categories: 'editor',
  homepage: 'editor',
  navigation: 'admin',
  footer: 'admin',
  seo: 'admin',
  settings: 'admin',
  users: 'admin',
} as const satisfies Record<string, UserRole>

export type PermissionKey = keyof typeof PERMISSIONS

export function can(role: UserRole | null | undefined, key: PermissionKey): boolean {
  return atLeast(role, PERMISSIONS[key])
}
