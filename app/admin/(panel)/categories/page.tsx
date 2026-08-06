import PageHead from '@/components/admin/PageHead'
import CollectionEditor, { type ColumnSpec } from '@/components/admin/CollectionEditor'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { saveCategories } from './actions'

export const metadata = { title: 'Categories' }

const COLUMNS: ColumnSpec[] = [
  { key: 'name', label: 'Name', type: 'text', required: true, width: '1fr' },
  { key: 'slug', label: 'Slug', type: 'slug', from: 'name', width: '1fr' },
  {
    key: 'type', label: 'Used as', type: 'select', width: '130px',
    options: [
      { value: 'genre', label: 'Genre' },
      { value: 'tag', label: 'Tag' },
      { value: 'category', label: 'Category' },
    ],
  },
  { key: 'visible', label: 'Visible', type: 'toggle', width: '80px' },
]

export default async function CategoriesPage() {
  await requireRole('editor')
  const db = await adminDb()
  const { data } = await db
    .from('categories')
    .select('id, name, slug, type, visible, sort_order')
    .order('type')
    .order('sort_order')

  return (
    <>
      <PageHead
        title="Categories"
        sub="Genres and tags books can be filed under. Drag to reorder — the order is what visitors see."
      />
      <section className="ad-panel">
        <div className="ad-panel-body">
          <CollectionEditor
            rows={(data ?? []) as never}
            columns={COLUMNS}
            onSave={saveCategories}
            blank={{ name: '', slug: '', type: 'genre', visible: true }}
            addLabel="Add category"
            emptyText="No categories yet. Add a genre to start filing books under it."
          />
        </div>
      </section>
    </>
  )
}
