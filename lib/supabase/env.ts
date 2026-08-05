/**
 * Supabase environment.
 *
 * The site is designed to boot even before Supabase is wired up: every query
 * helper falls back to empty results when `isConfigured` is false, so `npm run
 * dev` renders the shell instead of crashing on a missing env var. Once the
 * three variables below are set, everything switches over with no code change.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** Server-only. Never import this into a client component. */
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export function assertConfigured(): void {
  if (!isConfigured) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).',
    )
  }
}

/** Public URL for an object in the media bucket. */
export function storageUrl(path: string, bucket = 'media'): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
