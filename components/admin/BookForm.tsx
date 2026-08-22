'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import MediaPicker from './MediaPicker'
import { Area, Check, Field, Ic, OptionalNote, Repeater, Select, SlugPair, Submit, Text, useToast } from './ui'
import type { Folder, MediaItem } from './MediaBrowser'
import type { BarRow, FeatureRow, RetailerRow, SectionRow, TakeawayRow, VideoRow } from '@/app/admin/(panel)/books/actions'

export type BookFormData = {
  id?: string
  slug: string
  title: string
  subtitle: string
  author_id: string
  cover_id: string
  cover_3d_id: string
  about_image_id: string
  trailer_url: string
  summary: string
  description: string
  summary_lines: string
  pull_quote_lines: string
  primary_genre: string
  pages: string
  isbn: string
  language: string
  publisher: string
  publication_date: string
  published_label: string
  rating: string
  review_count: string
  review_excerpt: string
  review_overall: string
  featured: boolean
  verified: boolean
  sort_order: string
  status: string
  categoryIds: string[]
  galleryIds: string[]
  relatedIds: string[]
  features: FeatureRow[]
  retailers: RetailerRow[]
  videos: VideoRow[]
  reviewLoved: string
  reviewBetter: string
  reviewIntro: string
  reviewVerdict: string
  reviewQuote: string
  reviewSections: SectionRow[]
  reviewBars: BarRow[]
  summaryIntro: string
  summaryVerdict: string
  summaryQuote: string
  summarySections: SectionRow[]
  summaryTakeaways: TakeawayRow[]
  seoTitle: string
  seoDescription: string
  seoCanonical: string
  seoNoindex: boolean
  seoOgImageId: string
}

const TABS = ['Details', 'Media', 'Content', 'Review page', 'Summary page', 'Commerce', 'SEO'] as const
const ICONS = ['spark', 'twist', 'people', 'quill', 'shield', 'eye', 'book']

export default function BookForm({
  data,
  authors,
  categories,
  otherBooks,
  media,
  folders,
  supabaseUrl,
  onSave,
}: {
  data: BookFormData
  authors: { id: string; name: string }[]
  categories: { id: string; name: string }[]
  otherBooks: { id: string; title: string }[]
  media: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
  onSave: (fd: FormData) => Promise<{ ok: boolean; error?: string }>
}) {
  const router = useRouter()
  const toast = useToast()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Details')

  const [features, setFeatures] = useState(data.features)
  const [retailers, setRetailers] = useState(data.retailers)
  const [videos, setVideos] = useState(data.videos)
  const [reviewSections, setReviewSections] = useState(data.reviewSections)
  const [reviewBars, setReviewBars] = useState(data.reviewBars)
  const [summarySections, setSummarySections] = useState(data.summarySections)
  const [takeaways, setTakeaways] = useState(data.summaryTakeaways)
  const [gallery, setGallery] = useState<string[]>(data.galleryIds)
  const [related, setRelated] = useState<string[]>(data.relatedIds)

  const find = (id: string) => media.find((m) => m.id === id) ?? null
  const show = (t: (typeof TABS)[number]) => ({ display: tab === t ? undefined : 'none' })

  return (
    <form
      action={async (fd) => {
        const res = await onSave(fd)
        if (res.ok) {
          toast('Saved — the site is updated')
          router.refresh()
        } else {
          toast(res.error ?? 'Could not save', 'error')
        }
      }}
    >
      {/* hidden collections, posted as JSON with the form */}
      <input type="hidden" name="gallery_ids" value={JSON.stringify(gallery)} readOnly />
      <input type="hidden" name="related_ids" value={JSON.stringify(related)} readOnly />

      <div className="ad-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`ad-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <OptionalNote>
        Only the title and the address are needed. <b>Every other field here is optional — leave one
        empty and it is left off this book&rsquo;s pages entirely</b>, rather than showing a heading with
        nothing under it or a gap where it would have been. Each field, and each book, is on its own.
      </OptionalNote>

      {/* ------------------------------ Details ---------------------------- */}
      <div style={show('Details')}>
        <div className="ad-split">
          <section className="ad-panel">
            <div className="ad-panel-body">
              <SlugPair defaultTitle={data.title} defaultSlug={data.slug} prefix="/books/" />
              <Text label="Subtitle" name="subtitle" defaultValue={data.subtitle} optional />
              <Select
                label="Author"
                name="author_id"
                defaultValue={data.author_id}
                optional
                options={[{ value: '', label: '— none —' }, ...authors.map((a) => ({ value: a.id, label: a.name }))]}
                hint="Manage the list under Authors. Set to none and the by-line is left off."
              />
              <div className="ad-row">
                <Text label="Primary genre" name="primary_genre" defaultValue={data.primary_genre} optional />
                <Text label="Pages" name="pages" type="number" min={0} defaultValue={data.pages} optional />
              </div>
              <div className="ad-row">
                <Text label="Language" name="language" defaultValue={data.language} optional />
                <Text label="ISBN" name="isbn" defaultValue={data.isbn} optional />
              </div>
              <div className="ad-row">
                <Text label="Publisher" name="publisher" defaultValue={data.publisher} optional />
                <Text label="Publication date" name="publication_date" type="date" defaultValue={data.publication_date} optional />
              </div>
              <Text
                label="Date shown on the site"
                name="published_label"
                defaultValue={data.published_label}
                placeholder="Jan 12, 2023"
                optional
                hint="Free text — this is what visitors see, so write it however you like. Empty, and no date is shown."
              />

              <Field label="Genres &amp; tags" optional hint="Ticked genres appear on the book page and power recommendations. Tick none and the genre pill is left off.">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {categories.map((c) => (
                    <label key={c.id} className="ad-check" style={{ background: '#fbfaf7', border: '1px solid var(--ad-line-soft)', borderRadius: 7, padding: '5px 10px' }}>
                      <input type="checkbox" name="category_ids" value={c.id} defaultChecked={data.categoryIds.includes(c.id)} />
                      <span className="ad-check-text">{c.name}</span>
                    </label>
                  ))}
                  {!categories.length && <p className="ad-muted">No genres yet — add some under Categories.</p>}
                </div>
              </Field>
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section className="ad-panel">
              <div className="ad-panel-head"><h2>Publishing</h2></div>
              <div className="ad-panel-body">
                <Select
                  label="Status"
                  name="status"
                  defaultValue={data.status}
                  options={[
                    { value: 'draft', label: 'Draft — hidden from visitors' },
                    { value: 'published', label: 'Published — live on the site' },
                    { value: 'archived', label: 'Archived — hidden, kept for reference' },
                  ]}
                />
                <div style={{ marginTop: 12 }}>
                  <Check label="Feature this book" name="featured" hint="Featured titles come first in Top Picks." defaultChecked={data.featured} />
                  <Check label="Verified" name="verified" hint="Shows the verified mark on the book page." defaultChecked={data.verified} />
                </div>
                <Text label="Sort order" name="sort_order" type="number" defaultValue={data.sort_order} hint="Lower numbers appear first." />
              </div>
            </section>

            <section className="ad-panel">
              <div className="ad-panel-head"><h2>Rating</h2></div>
              <div className="ad-panel-body">
                <div className="ad-row">
                  <Text label="Rating" name="rating" type="number" step="0.1" min={0} max={5} defaultValue={data.rating} optional />
                  <Text label="Review count" name="review_count" type="number" min={0} defaultValue={data.review_count} optional />
                </div>
                <Text label="Our score" name="review_overall" type="number" step="0.1" min={0} max={5} defaultValue={data.review_overall} optional hint="Shown on the review page. Empty, and no score is shown." />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* ------------------------------- Media ----------------------------- */}
      <div style={show('Media')}>
        <div className="ad-grid ad-grid-2">
          <section className="ad-panel">
            <div className="ad-panel-head"><h2>Covers</h2></div>
            <div className="ad-panel-body">
              <MediaPicker name="cover_id" label="Cover" value={find(data.cover_id)} items={media} folders={folders} supabaseUrl={supabaseUrl} optional hint="Used everywhere the book appears. With none set, the cover slot is left off and the text takes the full width." />
              <MediaPicker name="cover_3d_id" label="3D cover" value={find(data.cover_3d_id)} items={media} folders={folders} supabaseUrl={supabaseUrl} optional hint="Falls back to the flat cover if empty." />
              <MediaPicker name="about_image_id" label="About image" value={find(data.about_image_id)} items={media} folders={folders} supabaseUrl={supabaseUrl} optional />
            </div>
          </section>

          <section className="ad-panel">
            <div className="ad-panel-head"><h2>Gallery</h2><p className="ad-muted">Extra images on the book page.</p></div>
            <div className="ad-panel-body">
              <GalleryPicker value={gallery} onChange={setGallery} media={media} folders={folders} supabaseUrl={supabaseUrl} />
            </div>
          </section>
        </div>

        <section className="ad-panel" style={{ marginTop: 16 }}>
          <div className="ad-panel-head">
            <h2>Videos</h2>
            <p className="ad-muted">Trailer, video review, video summary…</p>
          </div>
          <div className="ad-panel-body">
            <Text label="Trailer URL" name="trailer_url" defaultValue={data.trailer_url} optional placeholder="https://youtube.com/watch?v=…" />
            <div style={{ marginTop: 14 }}>
              <Repeater
                name="videos"
                value={videos}
                onChange={setVideos}
                blank={() => ({ kind: 'other', label: '', caption: '', duration: '', video_url: '', thumb_id: '' })}
                itemLabel={(i) => videos[i]?.label || `Video ${i + 1}`}
                addLabel="Add video"
                render={(v, set) => (
                  <>
                    <div className="ad-row">
                      <Field label="Label"><input className="ad-input" value={v.label} onChange={(e) => set({ label: e.target.value })} /></Field>
                      <Field label="Type">
                        <select className="ad-select" value={v.kind} onChange={(e) => set({ kind: e.target.value })}>
                          <option value="trailer">Trailer</option>
                          <option value="review">Video review</option>
                          <option value="summary">Video summary</option>
                          <option value="interview">Interview</option>
                          <option value="other">Other</option>
                        </select>
                      </Field>
                      <Field label="Duration" optional><input className="ad-input" value={v.duration} placeholder="2:18" onChange={(e) => set({ duration: e.target.value })} /></Field>
                    </div>
                    <Field label="Caption" optional><input className="ad-input" value={v.caption} onChange={(e) => set({ caption: e.target.value })} /></Field>
                    <Field label="Video URL" optional><input className="ad-input" value={v.video_url} onChange={(e) => set({ video_url: e.target.value })} /></Field>
                  </>
                )}
              />
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------ Content ---------------------------- */}
      <div style={show('Content')}>
        <div className="ad-split">
          <section className="ad-panel">
            <div className="ad-panel-body">
              <Area label="Description" name="description" defaultValue={data.description} big optional hint="The main blurb on the book page." />
              <Area label="Short summary" name="summary" defaultValue={data.summary} optional hint="One or two sentences, used in listings and by the assistant." />
              <Area
                label="Summary lines"
                name="summary_lines"
                defaultValue={data.summary_lines}
                optional
                hint="One per line. Short punchy fragments shown as a stack."
              />
              <Area
                label="Pull quote"
                name="pull_quote_lines"
                defaultValue={data.pull_quote_lines}
                optional
                hint="One line per row. Shown as the large quote on the book page — empty, and the quote block is left off."
              />
              <Area label="Review excerpt" name="review_excerpt" defaultValue={data.review_excerpt} optional hint="The snippet shown in Latest Book Reviews on the homepage." />
            </div>
          </section>

          <aside>
            <section className="ad-panel">
              <div className="ad-panel-head"><h2>What makes it special</h2></div>
              <div className="ad-panel-body">
                <Repeater
                  name="features"
                  value={features}
                  onChange={setFeatures}
                  blank={() => ({ icon: 'spark', title: '', text: '' })}
                  itemLabel={(i) => features[i]?.title || `Card ${i + 1}`}
                  addLabel="Add card"
                  render={(f, set) => (
                    <>
                      <div className="ad-row">
                        <Field label="Title"><input className="ad-input" value={f.title} onChange={(e) => set({ title: e.target.value })} /></Field>
                        <Field label="Icon">
                          <select className="ad-select" value={f.icon} onChange={(e) => set({ icon: e.target.value })}>
                            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Text" optional><textarea className="ad-textarea" style={{ minHeight: 56 }} value={f.text} onChange={(e) => set({ text: e.target.value })} /></Field>
                    </>
                  )}
                />
              </div>
            </section>

            <section className="ad-panel" style={{ marginTop: 16 }}>
              <div className="ad-panel-head"><h2>Related books</h2></div>
              <div className="ad-panel-body">
                <RelatedPicker value={related} onChange={setRelated} books={otherBooks} />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* --------------------------- Review page --------------------------- */}
      <div style={show('Review page')}>
        <p className="ad-hint" style={{ marginBottom: 12 }}>
          This is the long-form page at <code className="ad-mono">/books/{data.slug || '…'}/review</code>.
        </p>
        <div className="ad-split">
          <section className="ad-panel">
            <div className="ad-panel-body">
              <Area label="Intro paragraphs" name="review_intro" defaultValue={data.reviewIntro} optional hint="One paragraph per line." />
              <div style={{ marginTop: 14 }}>
                <Field label="Sections">
                  <Repeater
                    name="review_sections"
                    value={reviewSections}
                    onChange={setReviewSections}
                    blank={() => ({ heading: '', body: '' })}
                    itemLabel={(i) => reviewSections[i]?.heading || `Section ${i + 1}`}
                    addLabel="Add section"
                    render={(s, set) => (
                      <>
                        <Field label="Heading" optional><input className="ad-input" value={s.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
                        <Field label="Body"><textarea className="ad-textarea" value={s.body} onChange={(e) => set({ body: e.target.value })} /></Field>
                      </>
                    )}
                  />
                </Field>
              </div>
              <Area label="Verdict" name="review_verdict" defaultValue={data.reviewVerdict} optional />
              <Area label="Quote" name="review_quote" defaultValue={data.reviewQuote} optional hint="Empty, and the pull quote is left off the review page." />
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section className="ad-panel">
              <div className="ad-panel-head"><h2>What worked</h2></div>
              <div className="ad-panel-body">
                <Area label="Loved" name="review_loved" defaultValue={data.reviewLoved} optional hint="One per line." />
                <Area label="Could be better" name="review_better" defaultValue={data.reviewBetter} optional hint="One per line." />
              </div>
            </section>
            <section className="ad-panel">
              <div className="ad-panel-head"><h2>Score bars</h2></div>
              <div className="ad-panel-body">
                <Repeater
                  name="review_bars"
                  value={reviewBars}
                  onChange={setReviewBars}
                  blank={() => ({ label: '', value: 4 })}
                  itemLabel={(i) => reviewBars[i]?.label || `Bar ${i + 1}`}
                  addLabel="Add bar"
                  render={(b, set) => (
                    <div className="ad-row">
                      <Field label="Label"><input className="ad-input" value={b.label} onChange={(e) => set({ label: e.target.value })} /></Field>
                      <Field label="Out of 5"><input className="ad-input" type="number" step="0.1" min={0} max={5} value={b.value} onChange={(e) => set({ value: Number(e.target.value) })} /></Field>
                    </div>
                  )}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* --------------------------- Summary page -------------------------- */}
      <div style={show('Summary page')}>
        <p className="ad-hint" style={{ marginBottom: 12 }}>
          The page at <code className="ad-mono">/books/{data.slug || '…'}/summary</code>.
        </p>
        <div className="ad-split">
          <section className="ad-panel">
            <div className="ad-panel-body">
              <Area label="Intro" name="summary_intro" defaultValue={data.summaryIntro} optional hint="One paragraph per line." />
              <div style={{ marginTop: 14 }}>
                <Field label="Sections">
                  <Repeater
                    name="summary_sections"
                    value={summarySections}
                    onChange={setSummarySections}
                    blank={() => ({ heading: '', body: '' })}
                    itemLabel={(i) => summarySections[i]?.heading || `Section ${i + 1}`}
                    addLabel="Add section"
                    render={(s, set) => (
                      <>
                        <Field label="Heading" optional><input className="ad-input" value={s.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
                        <Field label="Body"><textarea className="ad-textarea" value={s.body} onChange={(e) => set({ body: e.target.value })} /></Field>
                      </>
                    )}
                  />
                </Field>
              </div>
              <Area label="Quote" name="summary_quote" defaultValue={data.summaryQuote} optional hint="Empty, and the pull quote is left off the summary page." />
              <input type="hidden" name="summary_verdict" value={data.summaryVerdict} readOnly />
            </div>
          </section>

          <aside>
            <section className="ad-panel">
              <div className="ad-panel-head"><h2>Takeaways</h2></div>
              <div className="ad-panel-body">
                <Repeater
                  name="summary_takeaways"
                  value={takeaways}
                  onChange={setTakeaways}
                  blank={() => ({ icon: 'book', title: '', text: '' })}
                  itemLabel={(i) => takeaways[i]?.title || `Takeaway ${i + 1}`}
                  addLabel="Add takeaway"
                  render={(t, set) => (
                    <>
                      <div className="ad-row">
                        <Field label="Title"><input className="ad-input" value={t.title} onChange={(e) => set({ title: e.target.value })} /></Field>
                        <Field label="Icon">
                          <select className="ad-select" value={t.icon} onChange={(e) => set({ icon: e.target.value })}>
                            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Text" optional><textarea className="ad-textarea" style={{ minHeight: 56 }} value={t.text} onChange={(e) => set({ text: e.target.value })} /></Field>
                    </>
                  )}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* ----------------------------- Commerce ---------------------------- */}
      <div style={show('Commerce')}>
        <section className="ad-panel">
          <div className="ad-panel-head">
            <h2>Where to buy</h2>
            <p className="ad-muted">Buttons shown in the availability card.</p>
          </div>
          <div className="ad-panel-body">
            <Repeater
              name="retailers"
              value={retailers}
              onChange={setRetailers}
              blank={() => ({ name: '', mark: '', tone: '#1f4634', url: '', cta: '' })}
              itemLabel={(i) => retailers[i]?.name || `Retailer ${i + 1}`}
              addLabel="Add retailer"
              render={(r, set) => (
                <>
                  <div className="ad-row">
                    <Field label="Name"><input className="ad-input" value={r.name} onChange={(e) => set({ name: e.target.value })} /></Field>
                    <Field label="Mark" optional><input className="ad-input" value={r.mark} placeholder="a" onChange={(e) => set({ mark: e.target.value })} /></Field>
                    <Field label="Colour"><input className="ad-input" type="color" style={{ padding: 3, height: 34 }} value={r.tone || '#1f4634'} onChange={(e) => set({ tone: e.target.value })} /></Field>
                  </div>
                  <div className="ad-row">
                    <Field label="Link" optional hint="No link, no button — the retailer is still listed by name."><input className="ad-input" value={r.url} placeholder="https://…" onChange={(e) => set({ url: e.target.value })} /></Field>
                    <Field label="Button text" optional><input className="ad-input" value={r.cta} placeholder={`View on ${r.name || '…'}`} onChange={(e) => set({ cta: e.target.value })} /></Field>
                  </div>
                </>
              )}
            />
          </div>
        </section>
      </div>

      {/* -------------------------------- SEO ------------------------------ */}
      <div style={show('SEO')}>
        <section className="ad-panel">
          <div className="ad-panel-head">
            <h2>Search &amp; social</h2>
            <p className="ad-muted">Leave blank to use the book’s own title and description.</p>
          </div>
          <div className="ad-panel-body">
            <Text label="Meta title" name="seo_title" defaultValue={data.seoTitle} optional hint="Around 60 characters reads best in Google." />
            <Area label="Meta description" name="seo_description" defaultValue={data.seoDescription} optional hint="Around 155 characters." />
            <Text label="Canonical URL" name="seo_canonical" defaultValue={data.seoCanonical} optional hint="Only needed if this content also lives at another address." />
            <MediaPicker name="seo_og_image_id" label="Share image" value={find(data.seoOgImageId)} items={media} folders={folders} supabaseUrl={supabaseUrl} optional hint="Shown when the page is shared. Falls back to the cover." />
            <div style={{ marginTop: 12 }}>
              <Check label="Hide from search engines" name="seo_noindex" hint="Adds noindex. The page stays reachable by direct link." defaultChecked={data.seoNoindex} />
            </div>
          </div>
        </section>
      </div>

      <div className="ad-sticky-save">
        <span className="ad-muted" style={{ fontSize: 12.6 }}>
          <Ic n="alert" style={{ width: 13, height: 13, verticalAlign: -2, marginRight: 4, stroke: 'currentColor', fill: 'none', strokeWidth: 1.8 }} />
          Changes go live as soon as you save.
        </span>
        <span className="ad-right">
          <Submit>Save book</Submit>
        </span>
      </div>
    </form>
  )
}

/* ------------------------------- sub-pickers ------------------------------ */

function GalleryPicker({
  value, onChange, media, folders, supabaseUrl,
}: {
  value: string[]
  onChange: (v: string[]) => void
  media: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
}) {
  const [adding, setAdding] = useState(false)
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {value.map((id) => {
          const m = media.find((x) => x.id === id)
          if (!m) return null
          return (
            <span key={id} style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${supabaseUrl}/storage/v1/object/public/media/${m.path}`}
                alt=""
                style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 7, border: '1px solid var(--ad-line)' }}
              />
              <button
                type="button"
                className="ad-btn ad-btn-icon"
                style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, padding: 0, borderRadius: '50%' }}
                onClick={() => onChange(value.filter((v) => v !== id))}
                aria-label="Remove"
              >
                <Ic n="x" style={{ width: 12, height: 12 }} />
              </button>
            </span>
          )
        })}
        {!value.length && <p className="ad-muted" style={{ fontSize: 13 }}>No gallery images.</p>}
      </div>

      {adding ? (
        <MediaPicker
          name="__gallery_add"
          label="Pick an image to add"
          items={media}
          folders={folders}
          supabaseUrl={supabaseUrl}
          value={null}
          onLibraryRefresh={() => setAdding(false)}
        />
      ) : null}

      <button type="button" className="ad-btn ad-btn-sm" onClick={() => setAdding((v) => !v)}>
        <Ic n="plus" />
        {adding ? 'Done' : 'Add image'}
      </button>
      {adding && (
        <p className="ad-hint">
          Choose a file above, then press <b>Add</b>.{' '}
          <button
            type="button"
            className="ad-btn ad-btn-sm"
            onClick={() => {
              const hidden = document.querySelector<HTMLInputElement>('input[name="__gallery_add"]')
              if (hidden?.value && !value.includes(hidden.value)) onChange([...value, hidden.value])
            }}
          >
            Add
          </button>
        </p>
      )}
    </>
  )
}

function RelatedPicker({
  value, onChange, books,
}: {
  value: string[]
  onChange: (v: string[]) => void
  books: { id: string; title: string }[]
}) {
  return (
    <>
      <p className="ad-hint" style={{ marginTop: 0, marginBottom: 8 }}>
        Leave empty and the site picks three other titles automatically.
      </p>
      <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {books.map((b) => (
          <label key={b.id} className="ad-check">
            <input
              type="checkbox"
              checked={value.includes(b.id)}
              onChange={(e) => onChange(e.target.checked ? [...value, b.id] : value.filter((v) => v !== b.id))}
            />
            <span className="ad-check-text">{b.title}</span>
          </label>
        ))}
      </div>
    </>
  )
}
