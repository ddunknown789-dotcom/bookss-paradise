'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ConfirmButton, Ic, useToast } from './ui'

/** Edit + delete for a table row, wired to any `(id) => ActionResult` action. */
export default function RowDelete({
  id,
  action,
  title,
  body,
  editHref,
  viewHref,
}: {
  id: string
  action: (id: string) => Promise<{ ok: boolean; error?: string; message?: string }>
  title: string
  body?: string
  editHref?: string
  viewHref?: string
}) {
  const router = useRouter()
  const toast = useToast()
  return (
    <>
      {viewHref && (
        <a className="ad-btn ad-btn-ghost ad-btn-icon" href={viewHref} target="_blank" rel="noreferrer" title="View on the site">
          <Ic n="external" />
        </a>
      )}
      {editHref && (
        <Link className="ad-btn ad-btn-ghost ad-btn-icon" href={editHref} title="Edit">
          <Ic n="edit" />
        </Link>
      )}
      <ConfirmButton
        className="ad-btn ad-btn-ghost ad-btn-icon"
        title={title}
        body={body}
        onConfirm={async () => {
          const res = await action(id)
          toast(res.ok ? res.message ?? 'Deleted' : res.error ?? 'Could not delete', res.ok ? 'ok' : 'error')
          if (res.ok) router.refresh()
        }}
      />
    </>
  )
}
