import PageHead from '@/components/admin/PageHead'
import CollectionEditor, { type ColumnSpec } from '@/components/admin/CollectionEditor'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { saveVideos } from './actions'

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

export default async function VideosPage() {
  await requireRole('editor')
  const db = await adminDb()
  const { data } = await db
    .from('videos')
    .select('id, key, icon, screen_label, title, description, cta_label, cta_href, video_url, status, sort_order')
    .order('sort_order')

  return (
    <>
      <PageHead title="Videos" sub="The “Stories Brought to Life” cards on the home page." />
      <section className="ad-panel">
        <div className="ad-panel-body">
          <CollectionEditor
            rows={(data ?? []) as never}
            columns={COLUMNS}
            onSave={saveVideos}
            blank={{ title: '', screen_label: '', description: '', icon: 'camera', cta_label: 'Watch', cta_href: '#', status: 'published', key: '' }}
            addLabel="Add video card"
            emptyText="No video cards yet."
          />
        </div>
      </section>
    </>
  )
}
