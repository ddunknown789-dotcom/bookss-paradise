import Link from 'next/link'

import PageHead from '@/components/admin/PageHead'
import EntityForm from '@/components/admin/EntityForm'
import MediaPicker from '@/components/admin/MediaPicker'
import SettingsForm from '@/components/admin/SettingsForm'
import { Area, Check, Ic, Select, Text } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { loadMediaLibrary, findMedia } from '@/lib/admin/media'
import { saveGlobalSeo } from './actions'
import { saveSettingsGroup } from '../settings/actions'

export const metadata = { title: 'SEO' }

export default async function SeoPage() {
  await requireRole('admin')
  const db = await adminDb()
  const { items: media, folders, supabaseUrl } = await loadMediaLibrary()

  const { data: seo } = await db
    .from('seo_meta')
    .select('*')
    .eq('entity_type', 'global')
    .is('entity_id', null)
    .maybeSingle()

  const { data: settings } = await db.from('settings').select('key, value, label, group_name').eq('group_name', 'seo')

  const { data: overrides } = await db
    .from('seo_meta')
    .select('id, entity_type, entity_id, title, robots_noindex')
    .neq('entity_type', 'global')
    .limit(100)

  const g = (seo ?? {}) as Record<string, any>

  return (
    <>
      <PageHead
        title="SEO"
        sub="How the site appears in search results and when links are shared."
      />

      <section className="ad-panel">
        <div className="ad-panel-head"><h2>Defaults</h2><p className="ad-muted">Used by any page without its own settings.</p></div>
        <div className="ad-panel-body">
          <SettingsForm
            group="seo"
            settings={(settings ?? []) as never}
            onSave={saveSettingsGroup}
            fields={[
              { key: 'seo.defaultTitle', label: 'Default title', type: 'text' },
              { key: 'seo.titleTemplate', label: 'Title template', type: 'text', hint: 'Use %s where the page title goes — for example “%s | Books Paradise”.' },
              { key: 'seo.defaultDescription', label: 'Default description', type: 'textarea', hint: 'Around 155 characters reads best.' },
              { key: 'seo.indexingEnabled', label: 'Allow search engines to index the site', type: 'toggle', hint: 'Turn off while the site is being built. This overrides every other setting.' },
              { key: 'seo.robotsExtra', label: 'Extra robots.txt rules', type: 'textarea', hint: 'Advanced. Appended to the generated robots.txt.' },
            ]}
          />
        </div>
      </section>

      <EntityForm onSave={saveGlobalSeo} saveLabel="Save SEO" note="Applies across the whole site.">
        <div className="ad-grid ad-grid-2">
          <section className="ad-panel">
            <div className="ad-panel-head"><h2>Search result</h2></div>
            <div className="ad-panel-body">
              <Text label="Meta title" name="title" defaultValue={g.title ?? ''} />
              <Area label="Meta description" name="description" defaultValue={g.description ?? ''} />
              <Text label="Keywords" name="keywords" defaultValue={(g.keywords ?? []).join(', ')} optional hint="Comma separated. Most search engines ignore these now." />
              <Text label="Canonical URL" name="canonical_url" defaultValue={g.canonical_url ?? ''} optional />
              <div style={{ marginTop: 10 }}>
                <Check label="Hide the whole site from search engines" name="robots_noindex" defaultChecked={g.robots_noindex ?? false} />
                <Check label="Tell search engines not to follow links" name="robots_nofollow" defaultChecked={g.robots_nofollow ?? false} />
              </div>
            </div>
          </section>

          <section className="ad-panel">
            <div className="ad-panel-head"><h2>Sharing preview</h2><p className="ad-muted">Facebook, LinkedIn, WhatsApp, X.</p></div>
            <div className="ad-panel-body">
              <Text label="Share title" name="og_title" defaultValue={g.og_title ?? ''} optional hint="Falls back to the meta title." />
              <Area label="Share description" name="og_description" defaultValue={g.og_description ?? ''} optional />
              <MediaPicker
                name="og_image_id"
                label="Share image"
                value={findMedia(media, g.og_image_id)}
                items={media}
                folders={folders}
                supabaseUrl={supabaseUrl}
                optional
                hint="1200×630 works best."
              />
              <Select
                label="X card style"
                name="twitter_card"
                defaultValue={g.twitter_card ?? 'summary_large_image'}
                options={[
                  { value: 'summary_large_image', label: 'Large image' },
                  { value: 'summary', label: 'Small thumbnail' },
                ]}
              />
              <div className="ad-row">
                <Text label="X site handle" name="twitter_site" defaultValue={g.twitter_site ?? ''} optional placeholder="@booksparadise" />
                <Text label="X creator handle" name="twitter_creator" defaultValue={g.twitter_creator ?? ''} optional />
              </div>
            </div>
          </section>
        </div>
      </EntityForm>

      <section className="ad-panel">
        <div className="ad-panel-head">
          <h2>Generated files</h2>
        </div>
        <div className="ad-panel-body">
          <p style={{ fontSize: 13.4, marginBottom: 10 }} className="ad-muted">
            Both are produced automatically from published content and refresh whenever you save.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a className="ad-btn ad-btn-sm" href="/sitemap.xml" target="_blank" rel="noreferrer"><Ic n="external" />sitemap.xml</a>
            <a className="ad-btn ad-btn-sm" href="/robots.txt" target="_blank" rel="noreferrer"><Ic n="external" />robots.txt</a>
          </div>
        </div>
      </section>

      {!!overrides?.length && (
        <section className="ad-panel">
          <div className="ad-panel-head"><h2>Page overrides</h2><p className="ad-muted">Pages with their own SEO settings.</p></div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>Type</th><th>Title</th><th>Indexed</th></tr></thead>
              <tbody>
                {overrides.map((o) => (
                  <tr key={o.id}>
                    <td style={{ textTransform: 'capitalize' }}>{o.entity_type}</td>
                    <td>
                      {o.entity_type === 'book' ? (
                        <Link href={`/admin/books/${o.entity_id}`} style={{ textDecoration: 'underline' }}>{o.title ?? '(no title)'}</Link>
                      ) : (
                        o.title ?? '(no title)'
                      )}
                    </td>
                    <td className="ad-tight">{o.robots_noindex ? <span className="ad-badge ad-badge-hidden">no</span> : <span className="ad-badge ad-badge-approved">yes</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
