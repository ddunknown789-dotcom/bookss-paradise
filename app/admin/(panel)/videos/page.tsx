import PageHead from '@/components/admin/PageHead'
import CollectionEditor, { type ColumnSpec, type Row } from '@/components/admin/CollectionEditor'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { loadMediaLibrary } from '@/lib/admin/media'
import { ASPECT_OPTIONS, WATCH_LIST } from '@/lib/video'
import type { WatchCategory } from '@/lib/video'
import { saveReviewVideos, saveSummaryVideos, saveTrailerVideos, saveVideos } from './actions'

export const metadata = { title: 'Videos' }

const COLUMNS: ColumnSpec[] = [
  { key: 'title', label: 'Card title', type: 'text', required: true, width: '1fr' },
  { key: 'screen_label', label: 'Label on thumbnail', type: 'text', width: '.8fr' },
  { key: 'description', label: 'Description', type: 'textarea', width: '1.6fr' },
  {
    key: 'icon', label: 'Badge', type: 'select', width: '110px',
    options: [
      { value: 'camera', label: 'Camera' },
      { value: 'book', label: 'Book' },
      { value: 'clapper', label: 'Clapper' },
    ],
  },
  { key: 'cta_label', label: 'Button', type: 'text', width: '.8fr' },
  { key: 'cta_href', label: 'Button link', type: 'text', width: '.8fr' },
  {
    key: 'status', label: 'Status', type: 'select', width: '110px',
    options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Hidden' }],
  },
]

/** One row is one video on a /watch gallery page. */
const GALLERY_COLUMNS: ColumnSpec[] = [
  { key: 'title', label: 'Title', type: 'text', required: true, width: '1.1fr' },
  { key: 'description', label: 'Description', type: 'textarea', width: '1.5fr' },
  {
    key: 'video_url', label: 'YouTube link or file URL', type: 'text', width: '1.2fr',
    placeholder: 'https://youtu.be/…',
  },
  { key: 'media_id', label: 'or upload', type: 'media', accept: 'video', width: '150px' },
  { key: 'poster_id', label: 'Poster', type: 'media', accept: 'image', width: '140px' },
  {
    key: 'aspect', label: 'Shape', type: 'select', width: '130px',
    options: ASPECT_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  },
  { key: 'duration', label: 'Length', type: 'text', width: '80px', placeholder: '8:45' },
  { key: 'published_at', label: 'Date', type: 'date', width: '140px' },
  {
    key: 'status', label: 'Status', type: 'select', width: '110px',
    options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Hidden' }],
  },
]

const GALLERY_FIELDS =
  'id, category, title, description, duration, published_at, video_url, media_id, poster_id, poster_url, aspect, status, sort_order'

const SAVE: Record<WatchCategory, (rows: Row[]) => Promise<{ ok: boolean; error?: string; message?: string }>> = {
  review: saveReviewVideos,
  summary: saveSummaryVideos,
  trailer: saveTrailerVideos,
}

export default async function VideosPage() {
  await requireRole('editor')
  const db = await adminDb()

  const [{ data: cards }, { data: gallery }, media] = await Promise.all([
    db
      .from('videos')
      .select('id, key, icon, screen_label, title, description, cta_label, cta_href, video_url, status, sort_order')
      .order('sort_order'),
    db.from('video_items').select(GALLERY_FIELDS).order('sort_order'),
    loadMediaLibrary(),
  ])

  return (
    <>
      <PageHead
        title="Videos"
        sub="The three cards on the home page, and the videos on the page each one opens."
      />

      <section className="ad-panel">
        <div className="ad-panel-head">
          <h2>Home page cards</h2>
          <p className="ad-muted">The “Stories Brought to Life” row. Each button opens one of the galleries below.</p>
        </div>
        <div className="ad-panel-body">
          <CollectionEditor
            rows={(cards ?? []) as never}
            columns={COLUMNS}
            onSave={saveVideos}
            blank={{ title: '', screen_label: '', description: '', icon: 'camera', cta_label: 'Watch', cta_href: '#', status: 'published', key: '' }}
            addLabel="Add video card"
            emptyText="No video cards yet."
          />
        </div>
      </section>

      {WATCH_LIST.map((page) => (
        <section className="ad-panel" key={page.category}>
          <div className="ad-panel-head">
            <h2>{page.kicker}</h2>
            <p className="ad-muted">
              Shown on <code>{page.path}</code>
            </p>
          </div>
          <div className="ad-panel-body">
            <CollectionEditor
              rows={(gallery ?? []).filter((r) => (r as { category: string }).category === page.category) as never}
              columns={GALLERY_COLUMNS}
              onSave={SAVE[page.category]}
              blank={{
                title: '', description: '', video_url: '', media_id: '', poster_id: '',
                aspect: 'auto', duration: '', published_at: '', status: 'published',
              }}
              addLabel="Add video"
              emptyText="No videos here yet."
              media={media}
              note={
                <>
                  Paste a YouTube link of any kind — a normal watch link, a share link, a Short — and it plays
                  embedded in the page rather than sending the visitor to YouTube. Or upload a video file and
                  choose it instead. Leave <b>Shape</b> on Auto unless a YouTube video isn’t 16:9; uploaded files
                  and Shorts are worked out on their own, and the gallery lays out any mix of shapes without
                  cropping them.
                </>
              }
            />
          </div>
        </section>
      ))}
    </>
  )
}
