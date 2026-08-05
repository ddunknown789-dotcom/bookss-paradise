/** Proves the published/draft boundary holds for anonymous visitors. */
import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const svc = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  const slug = 'rls-draft-probe'
  await svc.from('books').delete().eq('slug', slug)
  const { data: draft } = await svc.from('books')
    .insert({ slug, title: 'Draft Probe', status: 'draft' }).select('id').single()

  const { data: viaAnon } = await anon.from('books').select('id').eq('slug', slug)
  console.log('draft visible to anon      :', viaAnon?.length ? '✗ YES — leak' : '✓ no')

  await svc.from('book_features').insert({ book_id: draft!.id, title: 'secret feature' })
  const { data: kids } = await anon.from('book_features').select('id').eq('book_id', draft!.id)
  console.log('draft child rows to anon   :', kids?.length ? '✗ YES — leak' : '✓ no')

  await svc.from('books').update({ status: 'published' }).eq('slug', slug)
  const { data: nowVisible } = await anon.from('books').select('id').eq('slug', slug)
  console.log('after publish, anon sees it:', nowVisible?.length ? '✓ yes' : '✗ no — too strict')

  const { data: pending } = await svc.from('reviews')
    .insert({ book_id: draft!.id, author_name: 'probe', body: 'x', status: 'pending' }).select('id').single()
  const { data: seen } = await anon.from('reviews').select('id').eq('id', pending!.id)
  console.log('pending review to anon     :', seen?.length ? '✗ YES — leak' : '✓ no')

  await svc.from('books').delete().eq('slug', slug)
  console.log('\ncleaned up probe rows')
}
main().catch(e => { console.error(e); process.exit(1) })
