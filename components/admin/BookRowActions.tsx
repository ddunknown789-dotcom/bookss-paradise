'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmButton, Ic, useToast } from './ui'
import { deleteBook, duplicateBook, setBookStatus } from '@/app/admin/(panel)/books/actions'

/**
 * The per-row controls in the books table: view, duplicate, publish/unpublish,
 * delete. Kept in one client component so the list page itself stays a server
 * component and renders fast.
 */
export default function BookRowActions({
  id,
  slug,
  title,
  status,
}: {
  id: string
  slug: string
  title: string
  status: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>, okMsg: string) => {
    setBusy(true)
    try {
      const res = await fn()
      toast(res.ok ? res.message ?? okMsg : res.error ?? 'Failed', res.ok ? 'ok' : 'error')
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ad-row-actions">
      {status === 'published' && (
        <a
          className="ad-btn ad-btn-ghost ad-btn-icon"
          href={`/books/${slug}`}
          target="_blank"
          rel="noreferrer"
          title="View on the site"
        >
          <Ic n="external" />
        </a>
      )}

      <Link className="ad-btn ad-btn-ghost ad-btn-icon" href={`/admin/books/${id}`} title="Edit">
        <Ic n="edit" />
      </Link>

      <button
        type="button"
        className="ad-btn ad-btn-ghost ad-btn-icon"
        title="Duplicate"
        disabled={busy}
        onClick={() =>
          run(async () => {
            const res = await duplicateBook(id)
            if (res.ok && res.data) router.push(`/admin/books/${res.data.id}`)
            return res
          }, 'Duplicated as a draft')
        }
      >
        <Ic n="copy" />
      </button>

      <button
        type="button"
        className="ad-btn ad-btn-ghost ad-btn-icon"
        title={status === 'published' ? 'Unpublish' : 'Publish'}
        disabled={busy}
        onClick={() =>
          run(
            () => setBookStatus(id, status === 'published' ? 'draft' : 'published'),
            status === 'published' ? 'Moved to draft' : 'Published — it’s live now',
          )
        }
      >
        <Ic n={status === 'published' ? 'eyeOff' : 'eye'} />
      </button>

      <ConfirmButton
        className="ad-btn ad-btn-ghost ad-btn-icon"
        title={`Delete “${title}”?`}
        body="The book and everything attached to it — reviews, videos, summary and review pages — are removed permanently."
        confirmLabel="Delete book"
        onConfirm={() => run(() => deleteBook(id), 'Book deleted')}
      />
    </div>
  )
}
