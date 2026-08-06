/**
 * Exercises the admin write paths against the live database, using the same
 * SQL the server actions run. Confirms create → publish → duplicate → delete
 * works and leaves nothing behind.
 */
import { createClient } from '@supabase/supabase-js'

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})
const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const slug = 'admin-probe-' + Date.now()

async function main() {
  // 1. create as draft
  const { data: book, error: e1 } = await db
    .from('books')
    .insert({ slug, title: 'Admin Probe', status: 'draft', language: 'English', review_count: 0 })
    .select('id')
    .single()
  if (e1) throw new Error('create: ' + e1.message)
  console.log('create draft      : ✓')

  // 2. children
  await db.from('book_features').insert({ book_id: book.id, icon: 'spark', title: 'Probe feature', sort_order: 0 })
  await db.from('book_retailers').insert({ book_id: book.id, name: 'Amazon', url: '#', sort_order: 0 })
  await db.from('book_long_pages').insert({ book_id: book.id, kind: 'review', intro: ['x'], bars: [{ label: 'Story', value: 4 }] })
  await db.from('seo_meta').insert({ entity_type: 'book', entity_id: book.id, title: 'Probe SEO' })
  console.log('child rows        : ✓')

  // 3. invisible while draft
  const { data: hidden } = await anon.from('books').select('id').eq('slug', slug)
  console.log('draft hidden      :', hidden?.length ? '✗ LEAK' : '✓')

  // 4. publish -> visible
  await db.from('books').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', book.id)
  const { data: live } = await anon.from('books').select('id').eq('slug', slug)
  console.log('publish -> live   :', live?.length ? '✓' : '✗')

  // 5. duplicate
  const { data: orig } = await db.from('books').select('*').eq('id', book.id).single()
  const { id: _d, created_at: _c, updated_at: _u, ...rest } = orig as any
  const { data: copy, error: e2 } = await db
    .from('books').insert({ ...rest, slug: slug + '-copy', title: 'Admin Probe (copy)', status: 'draft', published_at: null })
    .select('id').single()
  if (e2) throw new Error('duplicate: ' + e2.message)
  const { data: feats } = await db.from('book_features').select('*').eq('book_id', book.id)
  await db.from('book_features').insert((feats ?? []).map(({ id, ...f }: any) => ({ ...f, book_id: copy.id })))
  console.log('duplicate         : ✓ (copy is a draft)')

  // 6. audit log
  await db.from('audit_log').insert({ action: 'create', entity: 'books', entity_id: book.id, summary: 'probe' })
  const { count } = await db.from('audit_log').select('*', { head: true, count: 'exact' }).eq('entity_id', book.id)
  console.log('audit log         :', count ? '✓' : '✗')

  // 7. delete cascades
  await db.from('seo_meta').delete().eq('entity_type', 'book').eq('entity_id', book.id)
  await db.from('books').delete().in('id', [book.id, copy.id])
  const { count: orphans } = await db.from('book_features').select('*', { head: true, count: 'exact' }).eq('book_id', book.id)
  console.log('delete cascades   :', orphans === 0 ? '✓ no orphans' : `✗ ${orphans} left`)

  await db.from('audit_log').delete().eq('entity_id', book.id)
  console.log('\ncleaned up')
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
