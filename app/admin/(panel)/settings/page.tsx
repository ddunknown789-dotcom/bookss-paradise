import PageHead from '@/components/admin/PageHead'
import SettingsForm from '@/components/admin/SettingsForm'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { saveSettingsGroup } from './actions'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  await requireRole('admin')
  const db = await adminDb()
  const { data: settings } = await db.from('settings').select('key, value, label, group_name')

  const group = (g: string) => ((settings ?? []).filter((s) => s.group_name === g) as never)

  const { count: subscribers } = await db.from('subscribers').select('*', { head: true, count: 'exact' })

  return (
    <>
      <PageHead title="Settings" sub="Site-wide details, contact information and optional features." />

      <div className="ad-grid ad-grid-2">
        <section className="ad-panel">
          <div className="ad-panel-head"><h2>General</h2></div>
          <div className="ad-panel-body">
            <SettingsForm
              group="general"
              settings={group('general')}
              onSave={saveSettingsGroup}
              fields={[
                { key: 'site.name', label: 'Site name', type: 'text' },
                { key: 'site.tagline', label: 'Tagline', type: 'text' },
                {
                  key: 'site.url',
                  label: 'Site address',
                  type: 'url',
                  hint: 'Used for canonical URLs, the sitemap and share previews. Include https://',
                },
                { key: 'site.logo', label: 'Logo path', type: 'text' },
                { key: 'site.favicon', label: 'Favicon path', type: 'text' },
              ]}
            />
          </div>
        </section>

        <section className="ad-panel">
          <div className="ad-panel-head"><h2>Contact</h2></div>
          <div className="ad-panel-body">
            <SettingsForm
              group="contact"
              settings={group('contact')}
              onSave={saveSettingsGroup}
              fields={[
                { key: 'contact.email', label: 'Email', type: 'email', hint: 'The assistant points people here when they ask how to get in touch.' },
                { key: 'contact.phone', label: 'Phone', type: 'text' },
                { key: 'contact.address', label: 'Address', type: 'textarea' },
              ]}
            />
          </div>
        </section>
      </div>

      <section className="ad-panel">
        <div className="ad-panel-head">
          <h2>Features</h2>
          <p className="ad-muted">Switch parts of the site on or off without touching code.</p>
        </div>
        <div className="ad-panel-body">
          <SettingsForm
            group="features"
            settings={group('features')}
            onSave={saveSettingsGroup}
            fields={[
              { key: 'features.chatEnabled', label: 'BP assistant', type: 'toggle', hint: 'The floating chat button on every page.' },
              { key: 'features.voiceEnabled', label: 'Assistant voice', type: 'toggle', hint: 'Reads replies aloud by default.' },
              { key: 'features.splashCursor', label: 'Fluid cursor effect', type: 'toggle', hint: 'The gold trail that follows the pointer.' },
              { key: 'features.particleField', label: 'Particle background', type: 'toggle' },
              { key: 'features.loader', label: 'Intro loader', type: 'toggle', hint: 'The animation before the home page appears.' },
            ]}
          />
        </div>
      </section>

      <section className="ad-panel">
        <div className="ad-panel-head"><h2>Newsletter</h2></div>
        <div className="ad-panel-body">
          <p style={{ fontSize: 14 }}>
            <b style={{ fontSize: 24, display: 'block' }}>{subscribers ?? 0}</b>
            <span className="ad-muted">people have signed up through the site.</span>
          </p>
        </div>
      </section>
    </>
  )
}
