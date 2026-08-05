/** Confirms the import landed intact and is readable by an anonymous visitor. */
import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const svc = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  for (const t of ['media','authors','categories','books','book_features','book_retailers','book_videos',
                   'book_review_points','book_sections','book_long_pages','interviews','interview_qa',
                   'weeks','week_books']) {
    const { count } = await svc.from(t as never).select('*', { head: true, count: 'exact' })
    process.stdout.write(`${t}=${count}  `)
  }
  console.log('\n')

  // Deep read of one book through the ANON key — the exact path the site uses.
  const { data: b, error } = await anon.from('books')
    .select(`title, pages, rating, published_label,
             author:authors(name),
             cover:media!books_cover_id_fkey(path),
             features:book_features(title),
             retailers:book_retailers(name),
             sections:book_sections(kind,heading)`)
    .eq('slug','the-silent-page').eq('status','published').single()
  if (error) { console.log('deep read: ✗', error.message); process.exitCode = 1; return }

  const r = b as any
  console.log('deep read via anon key:')
  console.log('  title     :', r.title, '—', r.author?.name)
  console.log('  meta      :', `${r.pages}pp  ★${r.rating}  ${r.published_label}`)
  console.log('  cover     :', r.cover?.path ?? 'MISSING')
  console.log('  features  :', r.features.length)
  console.log('  retailers :', r.retailers.length)
  console.log('  review §  :', r.sections.filter((s:any)=>s.kind==='review').length,
              ' summary §:', r.sections.filter((s:any)=>s.kind==='summary').length)

  const publicUrl = svc.storage.from('media').getPublicUrl(r.cover.path).data.publicUrl
  const res = await fetch(publicUrl, { method: 'HEAD' })
  console.log('  cover CDN :', res.ok ? `✓ ${res.status} ${res.headers.get('content-type')}` : `✗ ${res.status}`)
}
main().catch(e => { console.error(e); process.exit(1) })
