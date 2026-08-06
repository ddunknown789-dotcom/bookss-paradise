import 'server-only'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { assertRole } from '@/lib/auth'
import type { UserRole } from '@/lib/supabase/database.types'
import { revalidate } from '@/lib/cms/cache'

/**
 * Shared plumbing for every admin write.
 *
 * Each mutation goes through `mutate()`, which does four things in a fixed
 * order so no module can forget one:
 *
 *   1. verify the caller's role (throws if not allowed)
 *   2. run the write
 *   3. record it in audit_log
 *   4. revalidate the cache tags the public site reads
 *
 * Writes use the SERVICE-ROLE client, but only ever after step 1 has passed.
 * RLS is still the backstop for anything that reaches the database by another
 * route (the browser client, a leaked anon key), so this is defence in depth
 * rather than a way around the policies.
 */

export type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string }

export const ok = <T>(data?: T, message?: string): ActionResult<T> => ({ ok: true, data, message })
export const fail = (error: string): ActionResult<never> => ({ ok: false, error })

type MutateOptions<T> = {
  /** Minimum role permitted to run this. */
  role?: UserRole
  /** Table or feature name, for the audit trail. */
  entity: string
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'duplicate' | 'reorder' | 'upload' | 'settings'
  /** Human-readable line shown in the activity feed. */
  summary?: string | ((data: T) => string)
  entityId?: string | ((data: T) => string | null)
  /** Cache tags to invalidate once the write succeeds. */
  tags?: string[]
  diff?: unknown
}

export async function mutate<T>(
  run: (db: ReturnType<typeof createAdminClient>, actor: { id: string; email: string }) => Promise<T>,
  opts: MutateOptions<T>,
): Promise<ActionResult<T>> {
  let actor
  try {
    actor = await assertRole(opts.role ?? 'editor')
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Not allowed.')
  }

  let data: T
  try {
    const db = createAdminClient()
    data = await run(db, { id: actor.id, email: actor.email })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return fail(friendly(message))
  }

  // Audit and cache are best-effort: a failure here must not undo a good write.
  try {
    const db = createAdminClient()
    await db.from('audit_log').insert({
      actor_id: actor.id,
      actor_email: actor.email,
      action: opts.action,
      entity: opts.entity,
      entity_id: typeof opts.entityId === 'function' ? opts.entityId(data) : opts.entityId ?? null,
      summary: typeof opts.summary === 'function' ? opts.summary(data) : opts.summary ?? null,
      diff: (opts.diff ?? null) as never,
    })
  } catch {
    /* auditing is not worth failing a save over */
  }

  if (opts.tags?.length) revalidate(...opts.tags)

  return ok(data)
}

/** Turn Postgres errors into something a non-technical editor can act on. */
function friendly(message: string): string {
  if (/duplicate key.*slug/i.test(message)) return 'That slug is already in use — pick a different one.'
  if (/duplicate key.*email/i.test(message)) return 'That email address is already registered.'
  if (/duplicate key/i.test(message)) return 'That value has to be unique, and something already uses it.'
  if (/violates foreign key/i.test(message)) return 'Something this refers to no longer exists. Reload and try again.'
  if (/violates not-null/i.test(message)) {
    const col = /column "([^"]+)"/.exec(message)?.[1]
    return col ? `“${col.replace(/_/g, ' ')}” can’t be empty.` : 'A required field is empty.'
  }
  if (/permission denied|row-level security/i.test(message)) {
    return 'Your account doesn’t have permission to do that.'
  }
  return message
}

/* -------------------------------------------------------------------------- */
/* form helpers                                                                */
/* -------------------------------------------------------------------------- */

export const str = (fd: FormData, key: string): string => String(fd.get(key) ?? '').trim()
export const strOrNull = (fd: FormData, key: string): string | null => str(fd, key) || null
export const bool = (fd: FormData, key: string): boolean => fd.get(key) === 'on' || fd.get(key) === 'true'
export const num = (fd: FormData, key: string): number | null => {
  const v = str(fd, key)
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
export const int = (fd: FormData, key: string, fallback = 0): number => {
  const n = num(fd, key)
  return n === null ? fallback : Math.trunc(n)
}
/** Newline- or comma-separated textarea into a clean array. */
export const lines = (fd: FormData, key: string): string[] =>
  str(fd, key)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
export const csv = (fd: FormData, key: string): string[] =>
  str(fd, key)
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean)

/** JSON out of a hidden input written by a client-side repeater. */
export function json<T>(fd: FormData, key: string, fallback: T): T {
  const raw = str(fd, key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/**
 * A slug that definitely isn't taken. Appends -2, -3 … until it's free.
 * `ignoreId` lets an existing row keep its own slug while editing.
 */
export async function uniqueSlug(
  table: 'books' | 'authors' | 'interviews' | 'pages',
  desired: string,
  ignoreId?: string | null,
): Promise<string> {
  const db = createAdminClient()
  const base = slugify(desired) || 'untitled'
  let candidate = base
  for (let n = 2; n < 200; n++) {
    let q = db.from(table).select('id').eq('slug', candidate).limit(1)
    if (ignoreId) q = q.neq('id', ignoreId)
    const { data } = await q
    if (!data?.length) return candidate
    candidate = `${base}-${n}`
  }
  return `${base}-${Date.now()}`
}

/* -------------------------------------------------------------------------- */
/* reads for the admin (RLS-scoped to the signed-in user)                      */
/* -------------------------------------------------------------------------- */

/**
 * Admin list/detail reads go through the USER's client, not the service role:
 * an editor genuinely should not be able to read what their role can't see,
 * and using their own token means the policies get exercised on every page.
 */
export async function adminDb() {
  return createClient()
}
