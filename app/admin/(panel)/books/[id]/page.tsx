import Link from 'next/link'
import { notFound } from 'next/navigation'

import PageHead from '@/components/admin/PageHead'
import BookForm, { type BookFormData } from '@/components/admin/BookForm'
import { Badge, Ic } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { loadMediaLibrary } from '@/lib/admin/media'
import { createBook, updateBook } from '../actions'

export const metadata = { title: 'Edit book' }

const EMPTY: BookFormData = {
  slug: '', title: '', subtitle: '', author_id: '', cover_id: '', cover_3d_id: '', about_image_id: '',
  trailer_url: '', summary: '', description: '', summary_lines: '', pull_quote_lines: '',
  primary_genre: '', pages: '', isbn: '', language: 'English', publisher: '', publication_date: '',
  published_label: '', rating: '', review_count: '0', review_excerpt: '', review_overall: '',
  featured: false, verified: true, sort_order: '0', status: 'draft',
  categoryIds: [], galleryIds: [], relatedIds: [],
  features: [], retailers: [], videos: [],
  reviewLoved: '', reviewBetter: '', reviewIntro: '', reviewVerdict: '', reviewQuote: '',
  reviewSections: [], reviewBars: [],
  summaryIntro: '', summaryVerdict: '', summaryQuote: '', summarySections: [], summaryTakeaways: [],
  seoTitle: '', seoDescription: '', seoCanonical: '', seoNoindex: false, seoOgImageId: '',
}

export default async function BookEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  await requireRole('editor')
  const { id } = await params
  const { created } = await searchParams
  const isNew = id === 'new'

  const db = await adminDb()
  const [{ items: media, folders, supabaseUrl }, { data: authors }, { data: categories }, { data: allBooks }] =
    await Promise.all([
      loadMediaLibrary(),
      db.from('authors').select('id, name').order('name'),
      db.from('categories').select('id, name').eq('type', 'genre').order('sort_order'),
      db.from('books').select('id, title').order('title'),
    ])

  let data = EMPTY
  let title = 'New book'
  let status = 'draft'
  let slug = ''

  if (!isNew) {
    const { data: book } = await db
      .from('books')
      .select(
        `*,
         categories:book_categories(category_id, sort_order),
         gallery:book_media(media_id, sort_order),
         features:book_features(icon, title, text, sort_order),
         retailers:book_retailers(name, mark, tone, url, cta, sort_order),
         videos:book_videos(kind, label, caption, duration, video_url, thumb_id, sort_order),
         points:book_review_points(kind, text, sort_order),
         sections:book_sections(kind, heading, body, sort_order),
         longs:book_long_pages(kind, intro, verdict, quote, bars, takeaways)`,
      )
      .eq('id', id)
      .maybeSingle()

    if (!book) notFound()
    const b = book as Record<string, any>

    const { data: seo } = await db
      .from('seo_meta')
      .select('title, description, canonical_url, robots_noindex, og_image_id')
      .eq('entity_type', 'book')
      .eq('entity_id', id)
      .maybeSingle()

    const sorted = <T extends { sort_order: number }>(a: T[] | null): T[] =>
      [...(a ?? [])].sort((x, y) => x.sort_order - y.sort_order)
    const longOf = (kind: string) => (b.longs ?? []).find((l: any) => l.kind === kind)
    const sectionsOf = (kind: string) =>
      sorted(b.sections ?? []).filter((s: any) => s.kind === kind).map((s: any) => ({ heading: s.heading ?? '', body: s.body }))
    const pointsOf = (kind: string) =>
      sorted(b.points ?? []).filter((p: any) => p.kind === kind).map((p: any) => p.text).join('\n')

    title = b.title
    status = b.status
    slug = b.slug

    data = {
      id: b.id,
      slug: b.slug,
      title: b.title,
      subtitle: b.subtitle ?? '',
      author_id: b.author_id ?? '',
      cover_id: b.cover_id ?? '',
      cover_3d_id: b.cover_3d_id ?? '',
      about_image_id: b.about_image_id ?? '',
      trailer_url: b.trailer_url ?? '',
      summary: b.summary ?? '',
      description: b.description ?? '',
      summary_lines: (b.summary_lines ?? []).join('\n'),
      pull_quote_lines: (b.pull_quote_lines ?? []).join('\n'),
      primary_genre: b.primary_genre ?? '',
      pages: b.pages?.toString() ?? '',
      isbn: b.isbn ?? '',
      language: b.language ?? '',
      publisher: b.publisher ?? '',
      publication_date: b.publication_date ?? '',
      published_label: b.published_label ?? '',
      rating: b.rating?.toString() ?? '',
      review_count: b.review_count?.toString() ?? '0',
      review_excerpt: b.review_excerpt ?? '',
      review_overall: b.review_overall?.toString() ?? '',
      featured: b.featured,
      verified: b.verified,
      sort_order: b.sort_order?.toString() ?? '0',
      status: b.status,
      categoryIds: sorted(b.categories ?? []).map((c: any) => c.category_id),
      galleryIds: sorted(b.gallery ?? []).map((g: any) => g.media_id),
      relatedIds: [],
      features: sorted(b.features ?? []).map((f: any) => ({ icon: f.icon, title: f.title, text: f.text ?? '' })),
      retailers: sorted(b.retailers ?? []).map((r: any) => ({
        name: r.name, mark: r.mark ?? '', tone: r.tone ?? '#1f4634', url: r.url ?? '', cta: r.cta ?? '',
      })),
      videos: sorted(b.videos ?? []).map((v: any) => ({
        kind: v.kind, label: v.label, caption: v.caption ?? '', duration: v.duration ?? '',
        video_url: v.video_url ?? '', thumb_id: v.thumb_id ?? '',
      })),
      reviewLoved: pointsOf('loved'),
      reviewBetter: pointsOf('better'),
      reviewIntro: (longOf('review')?.intro ?? []).join('\n'),
      reviewVerdict: longOf('review')?.verdict ?? '',
      reviewQuote: longOf('review')?.quote ?? '',
      reviewSections: sectionsOf('review'),
      reviewBars: (longOf('review')?.bars ?? []) as { label: string; value: number }[],
      summaryIntro: (longOf('summary')?.intro ?? []).join('\n'),
      summaryVerdict: longOf('summary')?.verdict ?? '',
      summaryQuote: longOf('summary')?.quote ?? '',
      summarySections: sectionsOf('summary'),
      summaryTakeaways: (longOf('summary')?.takeaways ?? []) as { icon: string; title: string; text: string }[],
      seoTitle: seo?.title ?? '',
      seoDescription: seo?.description ?? '',
      seoCanonical: seo?.canonical_url ?? '',
      seoNoindex: seo?.robots_noindex ?? false,
      seoOgImageId: seo?.og_image_id ?? '',
    }

    const { data: rel } = await db.from('book_related').select('related_book_id, sort_order').eq('book_id', id).order('sort_order')
    data.relatedIds = (rel ?? []).map((r) => r.related_book_id)
  }

  async function save(fd: FormData) {
    'use server'
    return isNew ? createBook(fd) : updateBook(id, fd)
  }

  return (
    <>
      <PageHead
        title={isNew ? 'New book' : title}
        back={{ href: '/admin/books', label: 'Books' }}
        sub={
          isNew ? (
            'Fill in the details, then publish when it’s ready.'
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <Badge value={status} />
              {status === 'published' && (
                <Link href={`/books/${slug}`} target="_blank" style={{ textDecoration: 'underline' }}>
                  View on the site
                </Link>
              )}
            </span>
          )
        }
      />

      {created && (
        <div className="ad-alert ad-alert-ok">
          <Ic n="check" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
          <span>Book created as a draft. Set the status to Published on the Details tab when you’re ready.</span>
        </div>
      )}

      <BookForm
        data={data}
        authors={authors ?? []}
        categories={categories ?? []}
        otherBooks={(allBooks ?? []).filter((b) => b.id !== id)}
        media={media}
        folders={folders}
        supabaseUrl={supabaseUrl}
        onSave={save}
      />
    </>
  )
}
