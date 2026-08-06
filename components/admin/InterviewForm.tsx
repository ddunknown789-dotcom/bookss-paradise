'use client'

import { useState } from 'react'

import EntityForm from './EntityForm'
import MediaPicker from './MediaPicker'
import { Area, Field, Repeater, Select, SlugPair, Text } from './ui'
import type { Folder, MediaItem } from './MediaBrowser'
import type { QA } from '@/app/admin/(panel)/interviews/actions'

export default function InterviewForm({
  data,
  image,
  books,
  authors,
  media,
  folders,
  supabaseUrl,
  onSave,
}: {
  data: {
    title: string; slug: string; book_id: string; author_id: string; image_id: string
    intro: string; minutes: string; published_label: string; published_on: string
    status: string; sort_order: string; qa: QA[]
  }
  image: MediaItem | null
  books: { id: string; title: string }[]
  authors: { id: string; name: string }[]
  media: MediaItem[]
  folders: Folder[]
  supabaseUrl: string
  onSave: (fd: FormData) => Promise<{ ok: boolean; error?: string }>
}) {
  const [qa, setQa] = useState<QA[]>(data.qa)

  return (
    <EntityForm onSave={onSave} saveLabel="Save interview">
      <div className="ad-split">
        <section className="ad-panel">
          <div className="ad-panel-body">
            <SlugPair defaultTitle={data.title} defaultSlug={data.slug} prefix="/interviews/" />
            <Area label="Introduction" name="intro" defaultValue={data.intro} hint="The paragraph above the questions." />

            <div style={{ marginTop: 16 }}>
              <Field label="Questions &amp; answers">
                <Repeater
                  name="qa"
                  value={qa as unknown as Record<string, unknown>[]}
                  onChange={(v) => setQa(v as unknown as QA[])}
                  blank={() => ({ question: '', answer: '' })}
                  itemLabel={(i) => (qa[i]?.question ? `Q${i + 1}: ${qa[i].question.slice(0, 44)}` : `Question ${i + 1}`)}
                  addLabel="Add question"
                  render={(row, set) => {
                    const item = row as unknown as QA
                    return (
                      <>
                        <Field label="Question">
                          <input className="ad-input" value={item.question} onChange={(e) => set({ question: e.target.value } as never)} />
                        </Field>
                        <Field label="Answer">
                          <textarea className="ad-textarea" value={item.answer} onChange={(e) => set({ answer: e.target.value } as never)} />
                        </Field>
                      </>
                    )
                  }}
                />
              </Field>
            </div>
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="ad-panel">
            <div className="ad-panel-body">
              <Select
                label="Status"
                name="status"
                defaultValue={data.status}
                options={[
                  { value: 'draft', label: 'Draft — hidden' },
                  { value: 'published', label: 'Published — live' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
              <Select
                label="Author"
                name="author_id"
                defaultValue={data.author_id}
                options={[{ value: '', label: '— none —' }, ...authors.map((a) => ({ value: a.id, label: a.name }))]}
              />
              <Select
                label="About which book"
                name="book_id"
                defaultValue={data.book_id}
                options={[{ value: '', label: '— none —' }, ...books.map((b) => ({ value: b.id, label: b.title }))]}
              />
              <Text label="Sort order" name="sort_order" type="number" defaultValue={data.sort_order} />
            </div>
          </section>

          <section className="ad-panel">
            <div className="ad-panel-body">
              <MediaPicker
                name="image_id"
                label="Card image"
                value={image}
                items={media}
                folders={folders}
                supabaseUrl={supabaseUrl}
              />
              <Text label="Reading time" name="minutes" defaultValue={data.minutes} placeholder="12 min read" optional />
              <Text label="Date shown" name="published_label" defaultValue={data.published_label} placeholder="May 12, 2024" optional />
              <Text label="Date" name="published_on" type="date" defaultValue={data.published_on} optional hint="Used for sorting and the sitemap." />
            </div>
          </section>
        </aside>
      </div>
    </EntityForm>
  )
}
