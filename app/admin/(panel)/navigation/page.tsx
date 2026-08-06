import PageHead from '@/components/admin/PageHead'
import CollectionEditor, { type ColumnSpec } from '@/components/admin/CollectionEditor'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { savePrimaryMenu } from './actions'

export const metadata = { title: 'Navigation' }

const COLUMNS: ColumnSpec[] = [
  { key: 'label', label: 'Label', type: 'text', required: true, width: '1fr' },
  { key: 'href', label: 'Link', type: 'text', required: true, width: '1.4fr', placeholder: '/books or /#reviews' },
  {
    key: 'target', label: 'Opens', type: 'select', width: '130px',
    options: [{ value: '_self', label: 'Same tab' }, { value: '_blank', label: 'New tab' }],
  },
  { key: 'visible', label: 'Shown', type: 'toggle', width: '70px' },
]

export default async function NavigationPage() {
  await requireRole('admin')
  const db = await adminDb()
  const { data: menu } = await db.from('menus').select('id').eq('key', 'primary').maybeSingle()
  const { data: items } = await db
    .from('menu_items')
    .select('id, label, href, target, visible, sort_order')
    .eq('menu_id', menu?.id ?? '')
    .order('sort_order')

  return (
    <>
      <PageHead title="Navigation" sub="The links in the header, in order." />
      <section className="ad-panel">
        <div className="ad-panel-body">
          <CollectionEditor
            rows={(items ?? []) as never}
            columns={COLUMNS}
            onSave={savePrimaryMenu}
            blank={{ label: '', href: '/', target: '_self', visible: true }}
            addLabel="Add menu item"
            emptyText="No menu items — the header will be empty."
            note="Use /#books to scroll to a section on the home page, or /books for a separate page."
          />
        </div>
      </section>
    </>
  )
}
