/** Post-install check: tables present, defaults seeded, RLS actually enforcing. */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const svc = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

const TABLES = [
  'profiles','media_folders','media','categories','authors','books','book_categories','book_media',
  'book_videos','book_features','book_quotes','book_retailers','book_sections','book_long_pages',
  'book_review_points','book_related','reviews','interviews','interview_qa','weeks','week_books',
  'videos','services','pages','page_sections','menus','menu_items','social_links','seo_meta',
  'settings','subscribers','audit_log',
]

async function main() {
  const missing: string[] = []
  for (const t of TABLES) {
    const { error } = await svc.from(t as never).select('*', { head: true, count: 'exact' }).limit(0)
    if (error) missing.push(`${t} (${error.message})`)
  }
  console.log(`tables      : ${TABLES.length - missing.length}/${TABLES.length} present`)
  if (missing.length) { missing.forEach((m) => console.log('   missing:', m)); process.exitCode = 1 }

  const counts: Record<string, number> = {}
  for (const t of ['pages','page_sections','menus','menu_items','social_links','videos','services','settings','seo_meta']) {
    const { count } = await svc.from(t as never).select('*', { head: true, count: 'exact' })
    counts[t] = count ?? 0
  }
  console.log('seed rows   :', Object.entries(counts).map(([k, v]) => `${k}=${v}`).join('  '))

  const { data: bucket } = await svc.storage.getBucket('media')
  console.log('storage     :', bucket ? `bucket "media" (public=${bucket.public})` : 'MISSING')

  // RLS: an anonymous caller must not be able to write.
  //
  // NOTE: a blocked UPDATE/DELETE does NOT raise an error — RLS filters the
  // rows out via USING, so it's a silent no-op. Only INSERT raises 42501.
  // Verdicts below check what actually changed, not whether an error came back.
  const { error: wErr } = await anon.from('books').insert({ slug: 'rls-probe-' + Date.now(), title: 'probe' })
  console.log('anon insert :', wErr ? '✓ blocked' : '✗ ALLOWED — RLS problem')

  const { data: was } = await svc.from('settings').select('value').eq('key', 'site.name').single()
  const { data: touched } = await anon.from('settings').update({ value: '"probe"' }).eq('key', 'site.name').select()
  const { data: now } = await svc.from('settings').select('value').eq('key', 'site.name').single()
  const unchanged = JSON.stringify(was?.value) === JSON.stringify(now?.value)
  console.log('anon settings write:', unchanged && !touched?.length ? '✓ blocked (0 rows)' : '✗ ALLOWED — RLS problem')

  const { data: pub, error: rErr } = await anon.from('settings').select('key').limit(1)
  console.log('anon read   :', rErr ? `✗ ${rErr.message}` : `✓ ok (${pub?.length ?? 0} row)`)
}
main().catch((e) => { console.error(e); process.exit(1) })
