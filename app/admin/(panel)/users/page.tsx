import PageHead from '@/components/admin/PageHead'
import TeamRow from '@/components/admin/TeamRow'
import { Ic } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'

export const metadata = { title: 'Team' }

export default async function UsersPage() {
  const me = await requireRole('admin')
  const db = await adminDb()
  const { data: people } = await db
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('role')
    .order('email')

  return (
    <>
      <PageHead title="Team" sub="Who can sign in, and what each person is allowed to change." />

      <div className="ad-alert ad-alert-info">
        <Ic n="alert" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
        <span>
          New accounts are created in <b>Supabase → Authentication → Users</b>. Everyone starts as an Editor;
          promote them here.
        </span>
      </div>

      <section className="ad-panel">
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>Person</th><th>Role</th><th>Status</th><th /></tr></thead>
            <tbody>
              {(people ?? []).map((p) => (
                <TeamRow key={p.id} person={p as never} isSelf={p.id === me.id} myRole={me.profile.role} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ad-panel">
        <div className="ad-panel-head"><h2>What each role can do</h2></div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>Area</th><th>Editor</th><th>Admin</th><th>Owner</th></tr></thead>
            <tbody>
              {[
                ['Books, authors, reviews, interviews, media', true, true, true],
                ['Homepage section content', true, true, true],
                ['Add, remove and reorder sections', false, true, true],
                ['Navigation and footer', false, true, true],
                ['SEO and settings', false, true, true],
                ['Manage the team', false, true, true],
                ['Manage other owners', false, false, true],
              ].map(([area, e, a, o]) => (
                <tr key={area as string}>
                  <td>{area}</td>
                  {[e, a, o].map((yes, i) => (
                    <td key={i} className="ad-tight" style={{ textAlign: 'center' }}>
                      {yes ? <span style={{ color: 'var(--ad-ok)' }}>✓</span> : <span className="ad-faint">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
