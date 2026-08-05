/**
 * One-time content migration: moves everything that currently lives in
 * src/data/*.js into Supabase, and uploads the images in /public/assets to
 * Storage so the media library starts populated rather than empty.
 *
 *   npm run db:seed              # idempotent, safe to re-run
 *   npm run db:seed -- --media   # also upload /public/assets to Storage
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY: it writes as the service role so RLS
 * doesn't need a signed-in user for the initial import.
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

import type { Database } from '../lib/supabase/database.types'

// The legacy data files are plain ESM and still in the repo purely as the
// migration source. They can be deleted once this has run successfully.
// @ts-expect-error — untyped legacy JS
import { BOOKS, PAGE_QUOTE } from '../src/data/books.js'
// @ts-expect-error — untyped legacy JS
import { INTERVIEWS } from '../src/data/interviews.js'
// @ts-expect-error — untyped legacy JS
import { WEEKS_RESOLVED } from '../src/data/weeks.js'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL_ || !KEY) {
  console.error(
    'Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.',
  )
  process.exit(1)
}

const db = createClient<Database>(URL_, KEY, { auth: { persistSession: false } })
const withMedia = process.argv.includes('--media')

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
}

const kindFor = (mime: string): Database['public']['Enums']['media_kind'] =>
  mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : mime === 'application/pdf' ? 'pdf' : 'other'

/** local `/assets/x.png` path -> media row id, filled in during upload */
const mediaByPath = new Map<string, string>()

/* -------------------------------------------------------------------------- */
/* 1. media                                                                    */
/* -------------------------------------------------------------------------- */

async function uploadDir(dir: string, prefix = ''): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await uploadDir(full, `${prefix}${entry.name}/`)
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    const mime = MIME[ext]
    if (!mime) continue

    const objectPath = `${prefix}${entry.name}`
    const localRef = `/assets/${objectPath}`
    const body = await readFile(full)
    const info = await stat(full)

    const { error: upErr } = await db.storage
      .from('media')
      .upload(objectPath, body, { contentType: mime, upsert: true })
    if (upErr) {
      console.warn(`  ! upload ${objectPath}: ${upErr.message}`)
      continue
    }

    const { data, error } = await db
      .from('media')
      .upsert(
        {
          bucket: 'media',
          path: objectPath,
          filename: entry.name,
          original_name: entry.name,
          mime_type: mime,
          kind: kindFor(mime),
          size_bytes: info.size,
          alt_text: '',
        },
        { onConflict: 'bucket,path' },
      )
      .select('id')
      .single()

    if (error) {
      console.warn(`  ! media row ${objectPath}: ${error.message}`)
      continue
    }
    mediaByPath.set(localRef, data.id)
    process.stdout.write('.')
  }
}

async function seedMedia() {
  const assets = path.join(process.cwd(), 'public', 'assets')
  if (!existsSync(assets)) {
    console.log('· no public/assets directory, skipping media upload')
    return
  }
  console.log('→ uploading media')
  await uploadDir(assets)
  console.log(`\n  ${mediaByPath.size} files in the library`)
}

/** Look up an already-uploaded asset, tolerating .png/.jpg swaps. */
async function findMedia(localPath?: string | null): Promise<string | null> {
  if (!localPath) return null
  if (mediaByPath.has(localPath)) return mediaByPath.get(localPath)!

  const objectPath = localPath.replace(/^\/assets\//, '')
  const { data } = await db.from('media').select('id').eq('path', objectPath).maybeSingle()
  if (data) {
    mediaByPath.set(localPath, data.id)
    return data.id
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* 2. authors + categories                                                     */
/* -------------------------------------------------------------------------- */

const authorIds = new Map<string, string>()
const categoryIds = new Map<string, string>()

async function seedAuthors() {
  console.log('→ authors')
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
  console.log(`  ${names.length} authors`)
}

async function seedCategories() {
  console.log('→ genres')
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
  console.log(`  ${genres.length} genres`)
}

/* -------------------------------------------------------------------------- */
/* 3. books and everything hanging off them                                    */
/* -------------------------------------------------------------------------- */

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

const bookIds = new Map<string, string>()

async function seedBooks() {
  console.log('→ books')
  let order = 0

  for (const b of BOOKS as any[]) {
    const coverId = await findMedia(b.coverSrc)
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
    bookIds.set(b.slug, id)

    // child rows are replaced wholesale so re-running stays idempotent
    await Promise.all([
      db.from('book_categories').delete().eq('book_id', id),
      db.from('book_features').delete().eq('book_id', id),
      db.from('book_retailers').delete().eq('book_id', id),
      db.from('book_videos').delete().eq('book_id', id),
      db.from('book_review_points').delete().eq('book_id', id),
      db.from('book_sections').delete().eq('book_id', id),
      db.from('book_long_pages').delete().eq('book_id', id),
      db.from('book_quotes').delete().eq('book_id', id),
    ])

    const genres: string[] = b.genres ?? [b.genre]
    await db.from('book_categories').insert(
      genres
        .map((g, i) => ({ book_id: id, category_id: categoryIds.get(g)!, sort_order: i }))
        .filter((r) => r.category_id),
    )

    await db.from('book_features').insert(
      (b.special ?? []).map((f: any, i: number) => ({
        book_id: id,
        icon: f.icon,
        title: f.title,
        text: f.text,
        sort_order: i,
      })),
    )

    await db.from('book_retailers').insert(
      (b.retailers ?? []).map((r: any, i: number) => ({
        book_id: id,
        name: r.name,
        mark: r.mark,
        tone: r.tone,
        url: r.url,
        cta: r.cta,
        sort_order: i,
      })),
    )

    const videoKind = (label: string) =>
      /trailer/i.test(label) ? 'trailer' : /review/i.test(label) ? 'review' : /summary/i.test(label) ? 'summary' : 'other'

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
  console.log(`\n  ${BOOKS.length} books`)

  // The shared pull-quote banner shown at the foot of every book page.
  await db.from('book_quotes').insert({
    book_id: null,
    text: PAGE_QUOTE.text,
    attribution: PAGE_QUOTE.author,
    sort_order: 0,
  })
}

/* -------------------------------------------------------------------------- */
/* 4. interviews, weeks                                                        */
/* -------------------------------------------------------------------------- */

async function seedInterviews() {
  console.log('→ interviews')
  let order = 0
  for (const iv of INTERVIEWS as any[]) {
    const { data, error } = await db
      .from('interviews')
      .upsert(
        {
          slug: iv.slug,
          title: iv.title,
          book_id: bookIds.get(iv.bookSlug) ?? null,
          author_id: authorIds.get(iv.author) ?? null,
          image_id: await findMedia(iv.image),
          intro: iv.intro,
          minutes: iv.minutes,
          published_label: iv.date,
          published_on: iv.iso ?? null,
          status: 'published',
          sort_order: order++,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single()
    if (error) throw error

    await db.from('interview_qa').delete().eq('interview_id', data.id)
    await db.from('interview_qa').insert(
      (iv.qa ?? []).map((x: any, i: number) => ({
        interview_id: data.id, question: x.q, answer: x.a, sort_order: i,
      })),
    )
  }
  console.log(`  ${INTERVIEWS.length} interviews`)
}

async function seedWeeks() {
  console.log('→ book of the week')
  let order = 0
  for (const w of WEEKS_RESOLVED as any[]) {
    const { data, error } = await db
      .from('weeks')
      .upsert(
        { key: w.id, label: w.label, range_label: w.range, status: 'published', sort_order: order++ },
        { onConflict: 'key' },
      )
      .select('id')
      .single()
    if (error) throw error

    await db.from('week_books').delete().eq('week_id', data.id)
    for (const [i, b] of (w.books ?? []).entries()) {
      await db.from('week_books').insert({
        week_id: data.id,
        book_id: b.slug ? bookIds.get(b.slug) ?? null : null,
        title: b.title,
        author: b.author,
        genre: b.genre,
        pages: b.pages,
        published_label: b.published,
        cover_id: await findMedia(b.coverSrc),
        sort_order: i,
      })
    }
  }
  console.log(`  ${WEEKS_RESOLVED.length} weeks`)
}

/* -------------------------------------------------------------------------- */

async function main() {
  console.log('Seeding Books Paradise CMS\n')
  if (withMedia) await seedMedia()
  else console.log('· skipping media upload (pass --media to include it)')

  await seedAuthors()
  await seedCategories()
  await seedBooks()
  await seedInterviews()
  await seedWeeks()

  console.log('\nDone. Open /admin to manage it.')
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err)
  process.exit(1)
})
