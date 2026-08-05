/**
 * Connection smoke test. Prints only roles and reachability — never key values.
 *   npx tsx --env-file=.env.local scripts/check-connection.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const roleOf = (jwt: string): string => {
  try {
    return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString()).role
  } catch {
    return jwt.startsWith('sb_publishable_') ? 'publishable' : jwt.startsWith('sb_secret_') ? 'secret' : 'unknown'
  }
}

async function main() {
  console.log('host            :', url.replace(/https:\/\/([a-z0-9]{4}).*/, 'https://$1…….supabase.co'))
  console.log('anon key role   :', roleOf(anon))
  console.log('service key role:', roleOf(svc))

  const a = createClient(url, anon)
  const { error: e1 } = await a.from('books').select('id').limit(1)
  console.log('anon read       :', e1 ? `✗ ${e1.message}` : '✓ ok')

  const s = createClient(url, svc, { auth: { persistSession: false } })
  const { error: e2 } = await s.from('books').select('id').limit(1)
  console.log('service read    :', e2 ? `✗ ${e2.message}` : '✓ ok')
}

main().catch((e) => { console.error(e.message); process.exit(1) })
