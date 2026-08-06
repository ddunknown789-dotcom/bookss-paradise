'use client'

import { useRouter } from 'next/navigation'

import { Submit, useToast } from './ui'

/**
 * The standard save wrapper for a single-entity edit screen: submits to a
 * server action, reports the result as a toast, and refreshes so the page
 * reflects what was actually written.
 */
export default function EntityForm({
  onSave,
  saveLabel = 'Save changes',
  note = 'Changes go live as soon as you save.',
  extraActions,
  children,
}: {
  onSave: (fd: FormData) => Promise<{ ok: boolean; error?: string; message?: string }>
  saveLabel?: string
  note?: React.ReactNode
  extraActions?: React.ReactNode
  children: React.ReactNode
}) {
  const router = useRouter()
  const toast = useToast()

  return (
    <form
      action={async (fd) => {
        const res = await onSave(fd)
        if (res.ok) {
          toast(res.message ?? 'Saved')
          router.refresh()
        } else {
          toast(res.error ?? 'Could not save', 'error')
        }
      }}
    >
      {children}
      <div className="ad-sticky-save">
        {note && <span className="ad-muted" style={{ fontSize: 12.6 }}>{note}</span>}
        <span className="ad-right">
          {extraActions}
          <Submit>{saveLabel}</Submit>
        </span>
      </div>
    </form>
  )
}
