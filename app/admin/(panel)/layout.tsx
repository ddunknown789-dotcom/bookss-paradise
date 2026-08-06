import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import Shell from '@/components/admin/Shell'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getSetting } from '@/lib/cms/queries'
import '@/styles/admin.css'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Books Paradise Admin' },
  // The admin must never be indexed, whatever the site's SEO settings say.
  robots: { index: false, follow: false, nocache: true },
}

// Admin pages are per-user and must never be served from a shared cache.
export const dynamic = 'force-dynamic'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The middleware already turned away anyone without a session; this resolves
  // the actual role and is what every page's own requireRole() builds on.
  const user = await requireRole('editor')
  const siteUrl = await getSetting<string>('site.url', '/')

  return (
    <Shell
      role={user.profile.role}
      name={user.profile.full_name ?? ''}
      email={user.email}
      siteUrl={siteUrl}
      signOut={signOut}
    >
      {children}
    </Shell>
  )
}
