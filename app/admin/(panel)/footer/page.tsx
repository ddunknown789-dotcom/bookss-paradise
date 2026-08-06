import PageHead from '@/components/admin/PageHead'
import CollectionEditor, { type ColumnSpec } from '@/components/admin/CollectionEditor'
import SettingsForm from '@/components/admin/SettingsForm'
import { Ic } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { saveFooterExplore, saveFooterPages, saveSocialLinks } from '../navigation/actions'
import { saveSettingsGroup } from '../settings/actions'

export const metadata = { title: 'Footer' }

const LINK_COLUMNS: ColumnSpec[] = [
  { key: 'label', label: 'Label', type: 'text', required: true, width: '1fr' },
  { key: 'href', label: 'Link', type: 'text', required: true, width: '1.4fr' },
  { key: 'visible', label: 'Shown', type: 'toggle', width: '70px' },
]

const SOCIAL_COLUMNS: ColumnSpec[] = [
  { key: 'platform', label: 'Platform', type: 'text', required: true, width: '.8fr', placeholder: 'instagram' },
  { key: 'label', label: 'Label', type: 'text', width: '.8fr' },
  { key: 'url', label: 'URL', type: 'text', required: true, width: '1.6fr', placeholder: 'https://…' },
  { key: 'visible', label: 'Shown', type: 'toggle', width: '70px' },
]

export default async function FooterPage() {
  await requireRole('admin')
  const db = await adminDb()

  const menuItems = async (key: string) => {
    const { data: menu } = await db.from('menus').select('id').eq('key', key).maybeSingle()
    const { data } = await db
      .from('menu_items')
      .select('id, label, href, target, visible, sort_order')
      .eq('menu_id', menu?.id ?? '')
      .order('sort_order')
    return data ?? []
  }

  const [pages, explore, { data: socials }, { data: settings }] = await Promise.all([
    menuItems('footer_pages'),
    menuItems('footer_explore'),
    db.from('social_links').select('id, platform, label, url, icon, visible, sort_order').order('sort_order'),
    db.from('settings').select('key, value, label').eq('group_name', 'footer'),
  ])

  return (
    <>
      <PageHead title="Footer" sub="Text, links and social accounts shown at the foot of the site." />

      <div className="ad-alert ad-alert-info">
        <Ic n="alert" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
        <span>
          The current design has no footer bar on the page — this content is stored and ready, so a footer can be
          switched on without re-entering any of it.
        </span>
      </div>

      <section className="ad-panel">
        <div className="ad-panel-head"><h2>Footer text</h2></div>
        <div className="ad-panel-body">
          <SettingsForm
            group="footer"
            settings={(settings ?? []) as never}
            onSave={saveSettingsGroup}
            fields={[
              { key: 'footer.blurb', label: 'Blurb', type: 'textarea' },
              { key: 'footer.copyright', label: 'Copyright line', type: 'text', hint: 'Use {year} and it becomes the current year automatically.' },
              { key: 'footer.newsletterHeading', label: 'Newsletter heading', type: 'text' },
              { key: 'footer.newsletterBody', label: 'Newsletter body', type: 'textarea' },
            ]}
          />
        </div>
      </section>

      <section className="ad-panel">
        <div className="ad-panel-head"><h2>Pages column</h2></div>
        <div className="ad-panel-body">
          <CollectionEditor
            rows={pages as never}
            columns={LINK_COLUMNS}
            onSave={saveFooterPages}
            blank={{ label: '', href: '/', target: '_self', visible: true }}
            addLabel="Add link"
            emptyText="No links in this column."
          />
        </div>
      </section>

      <section className="ad-panel">
        <div className="ad-panel-head"><h2>Explore column</h2></div>
        <div className="ad-panel-body">
          <CollectionEditor
            rows={explore as never}
            columns={LINK_COLUMNS}
            onSave={saveFooterExplore}
            blank={{ label: '', href: '/', target: '_self', visible: true }}
            addLabel="Add link"
            emptyText="No links in this column."
          />
        </div>
      </section>

      <section className="ad-panel">
        <div className="ad-panel-head"><h2>Social accounts</h2></div>
        <div className="ad-panel-body">
          <CollectionEditor
            rows={(socials ?? []) as never}
            columns={SOCIAL_COLUMNS}
            onSave={saveSocialLinks}
            blank={{ platform: '', label: '', url: '', icon: '', visible: true }}
            addLabel="Add account"
            emptyText="No social accounts linked."
          />
        </div>
      </section>
    </>
  )
}
