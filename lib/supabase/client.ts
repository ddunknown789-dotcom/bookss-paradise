'use client'

import { createBrowserClient } from '@supabase/ssr'

import type { Database } from './database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null

/** Browser client, reused across the session so auth state stays in one place. */
export function createClient() {
  cached ??= createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  return cached
}
