/**
 * Replaces the book catalogue in Supabase with whatever is in
 * src/data/books.js — covers included.
 *
 *   npx tsx --env-file=.env.local scripts/replace-books.ts            # dry run
 *   npx tsx --env-file=.env.local scripts/replace-books.ts --apply    # write
 *
 * What it touches:
 *   · uploads /public/assets/books/*.jpg to Storage and registers them in media
 *   · upserts authors + genre categories the new titles need
 *   · upserts every book in books.js, in array order (sort_order 0..n), and
 *     rebuilds its child rows (features, retailers, videos, review points,
 *     long-form review/summary pages)
 *   · deletes any published book whose slug is NOT in books.js
 *
 * What it leaves alone: interviews, weeks, page sections, settings, media that
 * isn't a book cover. Unlike `db:seed` this will not overwrite edits made in
 * /admin to anything other than books.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY — it writes as the service role.
 */

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

import type { Database } from '../lib/supabase/database.types'

// @ts-expect-error — untyped legacy JS, still the editorial source of truth
import { BOOKS } from '../src/data/books.js'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL_ || !KEY) {
  console.error('Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.')
  process.exit(1)
}

const db = createClient<Database>(URL_, KEY, { auth: { persistSession: false } })
const APPLY = process.argv.includes('--apply')

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** "Jan 12, 2023" -> "2023-01-12" */
function toDate(label?: string): string | null {
  if (!label) return null
  const m = /([a-z]{3})[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i.exec(label)
  if (!m) return null
  const month = MONTHS.indexOf(m[1].toLowerCase())
  if (month < 0) return null
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`
}

/* -------------------------------------------------------------------------- */
/* covers                                                                      */
/* -------------------------------------------------------------------------- */

/** `/assets/books/x.jpg` -> media row id */
const mediaByPath = new Map<string, string>()

/** Upload one cover to Storage and register it in `media`. Idempotent. */
async function uploadCover(localRef: string): Promise<string | null> {
  if (mediaByPath.has(localRef)) return mediaByPath.get(localRef)!

  const objectPath = localRef.replace(/^\/assets\//, '')
  const file = path.join(process.cwd(), 'public', 'assets', objectPath)
  const filename = path.basename(objectPath)
  const mime = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'

  const body = await readFile(file)
  const info = await stat(file)

  const { error: upErr } = await db.storage
    .from('media')
    .upload(objectPath, body, { contentType: mime, upsert: true })
  if (upErr) {
    console.warn(`  ! upload ${objectPath}: ${upErr.message}`)
    return null
  }

  const { data, error } = await db
    .from('media')
    .upsert(
      {
        bucket: 'media',
        path: objectPath,
        filename,
        original_name: filename,
        mime_type: mime,
        kind: 'image',
        size_bytes: info.size,
        alt_text: '',
      },
      { onConflict: 'bucket,path' },
    )
    .select('id')
    .single()

  if (error) {
    console.warn(`  ! media row ${objectPath}: ${error.message}`)
    return null
  }
  mediaByPath.set(localRef, data.id)
  return data.id
}

/** Look up an asset already in the library (used for the shared video thumbs). */
async function findMedia(localPath?: string | null): Promise<string | null> {
  if (!localPath) return null
  if (mediaByPath.has(localPath)) return mediaByPath.get(localPath)!
  const objectPath = localPath.replace(/^\/assets\//, '')
  const { data } = await db.from('media').select('id').eq('path', objectPath).maybeSingle()
  if (!data) return null
  mediaByPath.set(localPath, data.id)
  return data.id
}

/* -------------------------------------------------------------------------- */
/* authors + genres                                                            */
/* -------------------------------------------------------------------------- */

const authorIds = new Map<string, string>()
const categoryIds = new Map<string, string>()

async function syncAuthors() {
  const names = [...new Set((BOOKS as any[]).map((b) => String(b.author)))]
  for (const name of names) {
    const { data, error } = await db
      .from('authors')
      .upsert({ slug: slugify(name), name, status: 'published' }, { onConflict: 'slug' })
      .select('id')
      .single()
    if (error) throw error
    authorIds.set(name, data.id)
  }
  console.log(`  authors  : ${names.length}`)
}

async function syncCategories() {
  const genres = [...new Set((BOOKS as any[]).flatMap((b) => (b.genres ?? [b.genre]) as string[]))]
  let i = 0
  for (const name of genres) {
    const { data, error } = await db
      .from('categories')
      .upsert({ type: 'genre', name, slug: slugify(name), sort_order: i++ }, { onConflict: 'type,slug' })
      .select('id')
      .single()
    if (error) throw error
    categoryIds.set(name, data.id)
  }
  console.log(`  genres   : ${genres.length}`)
}

/* -------------------------------------------------------------------------- */
/* books                                                                       */
/* -------------------------------------------------------------------------- */

const videoKind = (label: string) =>
  /trailer/i.test(label) ? 'trailer' : /review/i.test(label) ? 'review' : /summary/i.test(label) ? 'summary' : 'other'

async function syncBooks() {
  let order = 0

  for (const b of BOOKS as any[]) {
    const coverId = await uploadCover(b.coverSrc)
    const aboutId = await findMedia(b.aboutImage)

    const { data: book, error } = await db
      .from('books')
      .upsert(
        {
          slug: b.slug,
          title: b.title,
          author_id: authorIds.get(b.author) ?? null,
          cover_id: coverId,
          about_image_id: aboutId,
          summary: b.summaryBody ?? null,
          description: b.about ?? null,
          summary_lines: (b.summaryLines ?? []) as string[],
          pull_quote_lines: (b.pull ?? []) as string[],
          primary_genre: b.genre ?? null,
          pages: b.pages ?? null,
          language: b.language ?? 'English',
          publication_date: toDate(b.published),
          published_label: b.published ?? null,
          rating: b.rating ?? null,
          review_count: b.reviewCount ?? 0,
          review_excerpt: b.review?.text ?? null,
          review_overall: b.review?.overall ?? null,
          verified: b.verified ?? true,
          status: 'published',
          featured: order < 6,
          sort_order: order++,
          published_at: new Date().toISOString(),
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single()
    if (error) throw error

    const id = book.id

    // child rows are replaced wholesale so re-running stays idempotent
    await Promise.all([
      db.from('book_categories').delete().eq('book_id', id),
      db.from('book_features').delete().eq('book_id', id),
      db.from('book_retailers').delete().eq('book_id', id),
      db.from('book_videos').delete().eq('book_id', id),
      db.from('book_review_points').delete().eq('book_id', id),
      db.from('book_sections').delete().eq('book_id', id),
      db.from('book_long_pages').delete().eq('book_id', id),
    ])

    const genres: string[] = b.genres ?? [b.genre]
    await db.from('book_categories').insert(
      genres
        .map((g, i) => ({ book_id: id, category_id: categoryIds.get(g)!, sort_order: i }))
        .filter((r) => r.category_id),
    )

    await db.from('book_features').insert(
      (b.special ?? []).map((f: any, i: number) => ({
        book_id: id, icon: f.icon, title: f.title, text: f.text, sort_order: i,
      })),
    )

    await db.from('book_retailers').insert(
      (b.retailers ?? []).map((r: any, i: number) => ({
        book_id: id, name: r.name, mark: r.mark, tone: r.tone, url: r.url, cta: r.cta, sort_order: i,
      })),
    )

    for (const [i, v] of (b.videos ?? []).entries()) {
      await db.from('book_videos').insert({
        book_id: id,
        kind: videoKind(v.label) as any,
        label: v.label,
        caption: v.caption,
        duration: v.duration,
        thumb_id: await findMedia(v.thumb),
        sort_order: i,
      })
    }

    await db.from('book_review_points').insert([
      ...(b.review?.loved ?? []).map((t: string, i: number) => ({
        book_id: id, kind: 'loved' as const, text: t, sort_order: i,
      })),
      ...(b.review?.better ?? []).map((t: string, i: number) => ({
        book_id: id, kind: 'better' as const, text: t, sort_order: i,
      })),
    ])

    for (const kind of ['review', 'summary'] as const) {
      const page = kind === 'review' ? b.fullReview : b.fullSummary
      if (!page) continue

      await db.from('book_sections').insert(
        (page.sections ?? []).map((s: any, i: number) => ({
          book_id: id, kind, heading: s.title, body: s.body, sort_order: i,
        })),
      )

      await db.from('book_long_pages').insert({
        book_id: id,
        kind,
        intro: (Array.isArray(page.intro) ? page.intro : [page.intro].filter(Boolean)) as string[],
        verdict: page.verdict ?? null,
        quote: page.quote ?? null,
        bars: page.bars ?? [],
        takeaways: page.takeaways ?? [],
      })
    }

    process.stdout.write('.')
  }
  console.log(`\n  books    : ${BOOKS.length} upserted`)
}

/** Remove books that are no longer in books.js. Children cascade. */
async function pruneBooks(): Promise<string[]> {
  const keep = new Set((BOOKS as any[]).map((b) => String(b.slug)))
  const { data, error } = await db.from('books').select('id, slug, title')
  if (error) throw error

  const stale = (data ?? []).filter((b) => !keep.has(b.slug))
  if (!stale.length) {
    console.log('  stale    : none')
    return []
  }

  console.log(`  stale    : ${stale.length} → ${stale.map((b) => b.slug).join(', ')}`)
  if (!APPLY) return stale.map((b) => b.slug)

  const { error: delErr } = await db
    .from('books')
    .delete()
    .in('id', stale.map((b) => b.id))
  if (delErr) throw delErr
  return stale.map((b) => b.slug)
}

/* -------------------------------------------------------------------------- */

async function main() {
  console.log(APPLY ? 'Replacing the book catalogue\n' : 'DRY RUN — pass --apply to write\n')

  const keep = (BOOKS as any[]).map((b: any, i: number) => `${i}. ${b.title} — ${b.author}`)
  console.log('Incoming order (0-5 also fill the Latest Book Reviews grid):')
  console.log(keep.map((l) => `  ${l}`).join('\n'), '\n')

  if (!APPLY) {
    await pruneBooks()
    console.log('\nNothing written.')
    return
  }

  await syncAuthors()
  await syncCategories()
  await syncBooks()
  const removed = await pruneBooks()

  console.log(`\nDone. ${BOOKS.length} books live, ${removed.length} removed.`)
}

main().catch((err) => {
  console.error('\nFailed:', err.message ?? err)
  process.exit(1)
})
