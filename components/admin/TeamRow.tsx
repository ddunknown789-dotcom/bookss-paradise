'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Badge, Ic, useToast } from './ui'
import { updateTeamMember } from '@/app/admin/(panel)/users/actions'
import type { UserRole } from '@/lib/supabase/database.types'

type Person = { id: string; email: string; full_name: string | null; role: UserRole; is_active: boolean }

export default function TeamRow({ person, isSelf, myRole }: { person: Person; isSelf: boolean; myRole: UserRole }) {
  const router = useRouter()
  const toast = useToast()
  const [editing, setEditing] = useState(false)

  // An owner may only be edited by another owner; nobody edits themselves here.
  const locked = isSelf || (person.role === 'owner' && myRole !== 'owner')

  return (
    <tr>
      <td>
        <div className="ad-cell-main">
          <span className="ad-avatar" style={{ background: 'var(--ad-gold-soft)', color: 'var(--ad-gold)' }}>
            {(person.full_name || person.email).slice(0, 1).toUpperCase()}
          </span>
          <span className="ad-cell-title">
            <b>{person.full_name || person.email.split('@')[0]}{isSelf && <span className="ad-faint" style={{ fontWeight: 400 }}> (you)</span>}</b>
            <span>{person.email}</span>
          </span>
        </div>
      </td>

      {editing ? (
        <td colSpan={3}>
          <form
            style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
            action={async (fd) => {
              const res = await updateTeamMember(person.id, fd)
              toast(res.ok ? 'Updated' : res.error ?? 'Failed', res.ok ? 'ok' : 'error')
              if (res.ok) { setEditing(false); router.refresh() }
            }}
          >
            <input name="full_name" className="ad-input" style={{ width: 170 }} defaultValue={person.full_name ?? ''} placeholder="Full name" />
            <select name="role" className="ad-select" style={{ width: 'auto' }} defaultValue={person.role}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              {myRole === 'owner' && <option value="owner">Owner</option>}
            </select>
            <label className="ad-check">
              <input type="checkbox" name="is_active" defaultChecked={person.is_active} />
              <span className="ad-check-text">Can sign in</span>
            </label>
            <button type="submit" className="ad-btn ad-btn-sm ad-btn-primary">Save</button>
            <button type="button" className="ad-btn ad-btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        </td>
      ) : (
        <>
          <td className="ad-tight"><Badge value={person.role} /></td>
          <td className="ad-tight">
            {person.is_active
              ? <span className="ad-badge ad-badge-approved">active</span>
              : <span className="ad-badge ad-badge-hidden">deactivated</span>}
          </td>
          <td className="ad-tight">
            <div className="ad-row-actions">
              <button
                type="button"
                className="ad-btn ad-btn-ghost ad-btn-icon"
                onClick={() => setEditing(true)}
                disabled={locked}
                title={locked ? (isSelf ? 'You can’t change your own role' : 'Only an owner can edit an owner') : 'Edit'}
              >
                <Ic n="edit" />
              </button>
            </div>
          </td>
        </>
      )}
    </tr>
  )
}
