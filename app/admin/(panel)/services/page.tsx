import PageHead from '@/components/admin/PageHead'
import CollectionEditor, { type ColumnSpec } from '@/components/admin/CollectionEditor'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { saveServices } from './actions'

export const metadata = { title: 'Services' }

const COLUMNS: ColumnSpec[] = [
  { key: 'title_lines_text', label: 'Title (one line per row)', type: 'textarea', required: true, width: '1fr' },
  { key: 'description', label: 'Description', type: 'textarea', width: '1.6fr' },
  {
    key: 'glyph', label: 'Icon', type: 'select', width: '120px',
    options: [
      { value: 'social', label: 'Social' }, { value: 'pen', label: 'Pen' },
      { value: 'film', label: 'Film' }, { value: 'website', label: 'Website' },
      { value: 'author', label: 'Author' }, { value: 'blog', label: 'Blog' },
    ],
  },
  { key: 'visible', label: 'Shown', type: 'toggle', width: '70px' },
]

export default async function ServicesPage() {
  await requireRole('editor')
  const db = await adminDb()
  const { data } = await db.from('services').select('id, key, glyph, title_lines, description, visible, sort_order').order('sort_order')

  const rows = (data ?? []).map((s) => ({ ...s, title_lines_text: (s.title_lines ?? []).join('\n') }))

  return (
    <>
      <PageHead
        title="Services"
        sub="The six cards in “What We Offer” on the home page."
      />
      <section className="ad-panel">
        <div className="ad-panel-body">
          <CollectionEditor
            rows={rows as never}
            columns={COLUMNS}
            onSave={saveServices}
            blank={{ title_lines_text: '', description: '', glyph: 'social', visible: true, key: '' }}
            addLabel="Add service card"
            emptyText="No service cards — the What We Offer section will be empty."
            note="The title breaks exactly where you break the lines, so the cards stay the same shape as the design."
          />
        </div>
      </section>
    </>
  )
}
