'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Badge, ConfirmButton, Ic, useToast } from './ui'
import { deleteReview, setReviewStatus } from '@/app/admin/(panel)/reviews/actions'

type Review = {
  id: string
  author_name: string
  author_email: string | null
  rating: number | null
  title: string | null
  body: string
  status: string
  source: string
  featured: boolean
  created_at: string
  book: { id: string; title: string; slug: string } | null
}

export default function ReviewCard({ review: r }: { review: Review }) {
  const router = useRouter()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const act = async (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) => {
    setBusy(true)
    try {
      const res = await fn()
      toast(res.ok ? msg : res.error ?? 'Failed', res.ok ? 'ok' : 'error')
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <article style={{ border: '1px solid var(--ad-line-soft)', borderRadius: 9, padding: 13, background: '#fbfaf7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 13.6 }}>{r.author_name}</b>
        {r.rating != null && <span style={{ color: 'var(--ad-gold)', fontWeight: 600, fontSize: 12.6 }}>★ {r.rating}</span>}
        <Badge value={r.status} />
        {r.source === 'editorial' && <span className="ad-badge ad-badge-admin">editorial</span>}
        {r.featured && <span className="ad-badge ad-badge-owner">featured</span>}
        <span className="ad-faint" style={{ fontSize: 11.6, marginLeft: 'auto' }}>
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      </div>

      {r.book && (
        <p className="ad-muted" style={{ fontSize: 12.4, marginBottom: 5 }}>
          on <Link href={`/admin/books/${r.book.id}`} style={{ textDecoration: 'underline' }}>{r.book.title}</Link>
        </p>
      )}

      {r.title && <p style={{ fontWeight: 600, fontSize: 13.4, marginBottom: 3 }}>{r.title}</p>}
      <p style={{ fontSize: 13.2, lineHeight: 1.6, color: 'var(--ad-muted)', whiteSpace: 'pre-wrap' }}>{r.body}</p>

      <div style={{ display: 'flex', gap: 6, marginTop: 11, flexWrap: 'wrap' }}>
        {r.status !== 'approved' && (
          <button
            type="button"
            className="ad-btn ad-btn-sm ad-btn-primary"
            disabled={busy}
            onClick={() => act(() => setReviewStatus(r.id, 'approved'), 'Approved — it’s live on the site')}
          >
            <Ic n="check" />
            Approve
          </button>
        )}
        {r.status !== 'hidden' && (
          <button
            type="button"
            className="ad-btn ad-btn-sm"
            disabled={busy}
            onClick={() => act(() => setReviewStatus(r.id, 'hidden'), 'Hidden from the site')}
          >
            <Ic n="eyeOff" />
            Hide
          </button>
        )}
        {r.status !== 'pending' && (
          <button
            type="button"
            className="ad-btn ad-btn-sm"
            disabled={busy}
            onClick={() => act(() => setReviewStatus(r.id, 'pending'), 'Moved back to pending')}
          >
            Move to pending
          </button>
        )}
        {r.author_email && (
          <a className="ad-btn ad-btn-sm ad-btn-ghost" href={`mailto:${r.author_email}`}>{r.author_email}</a>
        )}
        <span style={{ marginLeft: 'auto' }}>
          <ConfirmButton
            label="Delete"
            icon={false}
            className="ad-btn ad-btn-danger ad-btn-sm"
            title="Delete this review?"
            body="It's removed permanently."
            onConfirm={() => act(() => deleteReview(r.id), 'Review deleted')}
          />
        </span>
      </div>
    </article>
  )
}
