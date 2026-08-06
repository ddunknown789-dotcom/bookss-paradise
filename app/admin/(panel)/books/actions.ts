'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { TAGS } from '@/lib/cms/cache'
import {
  bool, int, json, lines, mutate, num, str, strOrNull, uniqueSlug,
  type ActionResult,
} from '@/lib/admin/actions'
import type { ContentStatus } from '@/lib/supabase/database.types'

/* ============================================================================
   Book actions.

   A book is one row plus eight child tables. Child rows are replaced wholesale
   on save (delete-then-insert inside the same action) rather than diffed: the
   forms post the complete list every time, so a wholesale replace is both
   simpler and impossible to get out of sync.
   ========================================================================== */

export type FeatureRow = { icon: string; title: string; text: string }
export type RetailerRow = { name: string; mark: string; tone: string; url: string; cta: string }
export type VideoRow = { kind: string; label: string; caption: string; duration: string; video_url: string; thumb_id: string }
export type SectionRow = { heading: string; body: string }
export type BarRow = { label: string; value: number }
export type TakeawayRow = { icon: string; title: string; text: string }

const tagsFor = (slug: string) => [TAGS.books, TAGS.book(slug), TAGS.sections]

/** Every field on the main `books` row, read out of the form. */
function bookFields(fd: FormData, slug: string) {
  return {
    slug,
    title: str(fd, 'title'),
    subtitle: strOrNull(fd, 'subtitle'),
    author_id: strOrNull(fd, 'author_id'),
    cover_id: strOrNull(fd, 'cover_id'),
    cover_3d_id: strOrNull(fd, 'cover_3d_id'),
    about_image_id: strOrNull(fd, 'about_image_id'),
    trailer_url: strOrNull(fd, 'trailer_url'),
    trailer_media_id: strOrNull(fd, 'trailer_media_id'),
    summary: strOrNull(fd, 'summary'),
    description: strOrNull(fd, 'description'),
    summary_lines: lines(fd, 'summary_lines'),
    pull_quote_lines: lines(fd, 'pull_quote_lines'),
    primary_genre: strOrNull(fd, 'primary_genre'),
    pages: num(fd, 'pages'),
    isbn: strOrNull(fd, 'isbn'),
    language: str(fd, 'language') || 'English',
    publisher: strOrNull(fd, 'publisher'),
    publication_date: strOrNull(fd, 'publication_date'),
    published_label: strOrNull(fd, 'published_label'),
    rating: num(fd, 'rating'),
    review_count: int(fd, 'review_count', 0),
    review_excerpt: strOrNull(fd, 'review_excerpt'),
    review_overall: num(fd, 'review_overall'),
    featured: bool(fd, 'featured'),
    verified: bool(fd, 'verified'),
    sort_order: int(fd, 'sort_order', 0),
    status: (str(fd, 'status') || 'draft') as ContentStatus,
  }
}

/** Replace every child collection for a book from the posted form. */
async function saveChildren(db: ReturnType<typeof import('@/lib/supabase/server').createAdminClient>, id: string, fd: FormData) {
  await Promise.all([
    db.from('book_categories').delete().eq('book_id', id),
    db.from('book_features').delete().eq('book_id', id),
    db.from('book_retailers').delete().eq('book_id', id),
    db.from('book_videos').delete().eq('book_id', id),
    db.from('book_review_points').delete().eq('book_id', id),
    db.from('book_sections').delete().eq('book_id', id),
    db.from('book_long_pages').delete().eq('book_id', id),
    db.from('book_related').delete().eq('book_id', id),
    db.from('book_media').delete().eq('book_id', id),
  ])

  const categoryIds = fd.getAll('category_ids').map(String).filter(Boolean)
  if (categoryIds.length) {
    await db.from('book_categories').insert(categoryIds.map((cid, i) => ({ book_id: id, category_id: cid, sort_order: i })))
  }

  const gallery = json<string[]>(fd, 'gallery_ids', [])
  if (gallery.length) {
    await db.from('book_media').insert(gallery.map((mid, i) => ({ book_id: id, media_id: mid, role: 'gallery', sort_order: i })))
  }

  const features = json<FeatureRow[]>(fd, 'features', [])
  if (features.length) {
    await db.from('book_features').insert(
      features.filter((f) => f.title?.trim()).map((f, i) => ({
        book_id: id, icon: f.icon || 'spark', title: f.title, text: f.text || null, sort_order: i,
      })),
    )
  }

  const retailers = json<RetailerRow[]>(fd, 'retailers', [])
  if (retailers.length) {
    await db.from('book_retailers').insert(
      retailers.filter((r) => r.name?.trim()).map((r, i) => ({
        book_id: id, name: r.name, mark: r.mark || null, tone: r.tone || null,
        url: r.url || null, cta: r.cta || `View on ${r.name}`, sort_order: i,
      })),
    )
  }

  const videos = json<VideoRow[]>(fd, 'videos', [])
  if (videos.length) {
    await db.from('book_videos').insert(
      videos.filter((v) => v.label?.trim()).map((v, i) => ({
        book_id: id,
        kind: (v.kind || 'other') as never,
        label: v.label,
        caption: v.caption || null,
        duration: v.duration || null,
        video_url: v.video_url || null,
        thumb_id: v.thumb_id || null,
        sort_order: i,
      })),
    )
  }

  const loved = lines(fd, 'review_loved')
  const better = lines(fd, 'review_better')
  const points = [
    ...loved.map((text, i) => ({ book_id: id, kind: 'loved' as const, text, sort_order: i })),
    ...better.map((text, i) => ({ book_id: id, kind: 'better' as const, text, sort_order: i })),
  ]
  if (points.length) await db.from('book_review_points').insert(points)

  const related = json<string[]>(fd, 'related_ids', []).filter((r) => r && r !== id)
  if (related.length) {
    await db.from('book_related').insert(related.map((rid, i) => ({ book_id: id, related_book_id: rid, sort_order: i })))
  }

  // The two long-form pages
  for (const kind of ['review', 'summary'] as const) {
    const sections = json<SectionRow[]>(fd, `${kind}_sections`, []).filter((s) => s.body?.trim())
    if (sections.length) {
      await db.from('book_sections').insert(
        sections.map((s, i) => ({ book_id: id, kind, heading: s.heading || null, body: s.body, sort_order: i })),
      )
    }

    const intro = lines(fd, `${kind}_intro`)
    const verdict = strOrNull(fd, `${kind}_verdict`)
    const quote = strOrNull(fd, `${kind}_quote`)
    const bars = kind === 'review' ? json<BarRow[]>(fd, 'review_bars', []) : []
    const takeaways = kind === 'summary' ? json<TakeawayRow[]>(fd, 'summary_takeaways', []) : []

    if (intro.length || verdict || quote || bars.length || takeaways.length || sections.length) {
      await db.from('book_long_pages').insert({
        book_id: id, kind, intro, verdict, quote,
        bars: bars as never, takeaways: takeaways as never,
      })
    }
  }

  // Per-book SEO
  const seoTitle = strOrNull(fd, 'seo_title')
  const seoDesc = strOrNull(fd, 'seo_description')
  const seoCanonical = strOrNull(fd, 'seo_canonical')
  const seoNoindex = bool(fd, 'seo_noindex')
  const seoOgImage = strOrNull(fd, 'seo_og_image_id')

  await db.from('seo_meta').delete().eq('entity_type', 'book').eq('entity_id', id)
  if (seoTitle || seoDesc || seoCanonical || seoNoindex || seoOgImage) {
    await db.from('seo_meta').insert({
      entity_type: 'book', entity_id: id,
      title: seoTitle, description: seoDesc, canonical_url: seoCanonical,
      robots_noindex: seoNoindex, og_image_id: seoOgImage, og_type: 'article',
    })
  }
}

/* -------------------------------- create ---------------------------------- */

export async function createBook(fd: FormData): Promise<ActionResult> {
  const title = str(fd, 'title')
  if (!title) return { ok: false, error: 'Give the book a title.' }

  const slug = await uniqueSlug('books', str(fd, 'slug') || title)

  const res = await mutate(
    async (db, actor) => {
      const { data, error } = await db
        .from('books')
        .insert({ ...bookFields(fd, slug), created_by: actor.id })
        .select('id, slug')
        .single()
      if (error) throw error
      await saveChildren(db, data.id, fd)
      return data
    },
    { entity: 'books', action: 'create', summary: `Created “${title}”`, entityId: (d) => d.id, tags: tagsFor(slug) },
  )

  if (!res.ok) return res
  revalidatePath('/admin/books')
  redirect(`/admin/books/${(res.data as { id: string }).id}?created=1`)
}

/* -------------------------------- update ---------------------------------- */

export async function updateBook(id: string, fd: FormData): Promise<ActionResult> {
  const title = str(fd, 'title')
  if (!title) return { ok: false, error: 'Give the book a title.' }

  const slug = await uniqueSlug('books', str(fd, 'slug') || title, id)

  const res = await mutate(
    async (db) => {
      const { error } = await db.from('books').update(bookFields(fd, slug)).eq('id', id)
      if (error) throw error
      await saveChildren(db, id, fd)
      return { id, slug }
    },
    { entity: 'books', action: 'update', entityId: id, summary: `Updated “${title}”`, tags: tagsFor(slug) },
  )

  if (res.ok) revalidatePath(`/admin/books/${id}`)
  return res
}

/* ------------------------- status, duplicate, delete ---------------------- */

export async function setBookStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      const { data, error } = await db
        .from('books')
        .update({ status, published_at: status === 'published' ? new Date().toISOString() : null })
        .eq('id', id)
        .select('title, slug')
        .single()
      if (error) throw error
      return data
    },
    {
      entity: 'books',
      action: status === 'published' ? 'publish' : 'unpublish',
      entityId: id,
      summary: (d) => `${status === 'published' ? 'Published' : status === 'archived' ? 'Archived' : 'Unpublished'} “${d.title}”`,
      tags: [TAGS.books, TAGS.sections],
    },
  )
  if (res.ok) {
    revalidatePath('/admin/books')
    revalidatePath(`/admin/books/${id}`)
  }
  return res
}

export async function duplicateBook(id: string): Promise<ActionResult<{ id: string }>> {
  const res = await mutate(
    async (db, actor) => {
      const { data: original, error } = await db.from('books').select('*').eq('id', id).single()
      if (error) throw error

      const slug = await uniqueSlug('books', `${original.slug}-copy`)
      const { id: _drop, created_at: _c, updated_at: _u, ...rest } = original

      const { data: copy, error: insErr } = await db
        .from('books')
        .insert({
          ...rest,
          slug,
          title: `${original.title} (copy)`,
          status: 'draft',      // a duplicate is never live by accident
          featured: false,
          published_at: null,
          created_by: actor.id,
        })
        .select('id')
        .single()
      if (insErr) throw insErr

      // Copy every child collection across.
      const copyChildren = async (table: string, extra: Record<string, unknown> = {}) => {
        const { data: rows } = await db.from(table as never).select('*').eq('book_id', id)
        if (!rows?.length) return
        await db
          .from(table as never)
          .insert((rows as Record<string, unknown>[]).map(({ id: _rid, ...r }) => ({ ...r, ...extra, book_id: copy.id })) as never)
      }
      await Promise.all([
        copyChildren('book_categories'), copyChildren('book_media'), copyChildren('book_videos'),
        copyChildren('book_features'), copyChildren('book_retailers'), copyChildren('book_sections'),
        copyChildren('book_review_points'), copyChildren('book_related'),
      ])
      // book_long_pages has a composite key, so drop nothing but book_id
      const { data: longs } = await db.from('book_long_pages').select('*').eq('book_id', id)
      if (longs?.length) {
        await db.from('book_long_pages').insert(longs.map((l) => ({ ...l, book_id: copy.id })) as never)
      }

      return { id: copy.id, title: original.title }
    },
    {
      entity: 'books',
      action: 'duplicate',
      entityId: (d) => d.id,
      summary: (d) => `Duplicated “${d.title}”`,
      tags: [TAGS.books],
    },
  )
  if (res.ok) revalidatePath('/admin/books')
  return res as ActionResult<{ id: string }>
}

export async function deleteBook(id: string): Promise<ActionResult> {
  const res = await mutate(
    async (db) => {
      const { data } = await db.from('books').select('title, slug').eq('id', id).single()
      // Child rows cascade; seo_meta is polymorphic so it needs a manual sweep.
      await db.from('seo_meta').delete().eq('entity_type', 'book').eq('entity_id', id)
      const { error } = await db.from('books').delete().eq('id', id)
      if (error) throw error
      return data ?? { title: 'a book', slug: '' }
    },
    {
      entity: 'books',
      action: 'delete',
      entityId: id,
      summary: (d) => `Deleted “${d.title}”`,
      tags: [TAGS.books, TAGS.sections],
      role: 'editor',
    },
  )
  if (res.ok) revalidatePath('/admin/books')
  return res
}

export async function reorderBooks(ids: string[]): Promise<ActionResult> {
  return mutate(
    async (db) => {
      for (const [i, id] of ids.entries()) {
        await db.from('books').update({ sort_order: i }).eq('id', id)
      }
      return null
    },
    { entity: 'books', action: 'reorder', summary: 'Reordered books', tags: [TAGS.books, TAGS.sections] },
  )
}
