import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { isConfigured } from '@/lib/supabase/env'
import { Ic } from '@/components/admin/ui'
import '@/styles/admin.css'

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } }

async function signIn(formData: FormData) {
  'use server'

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/admin')

  if (!email || !password) redirect('/admin/login?error=Enter%20your%20email%20and%20password.')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Deliberately vague: never reveal whether an address has an account.
    const message =
      /invalid login/i.test(error.message) ? 'That email and password don’t match.' : error.message
    redirect(`/admin/login?error=${encodeURIComponent(message)}`)
  }

  // A signed-in user with no active profile is deactivated, not unknown.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_active').eq('id', user.id).maybeSingle()
    if (profile && !profile.is_active) {
      await supabase.auth.signOut()
      redirect('/admin/login?error=' + encodeURIComponent('That account has been deactivated.'))
    }
  }

  redirect(next.startsWith('/admin') ? next : '/admin')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <div className="ad">
      <div className="ad-login">
        <div className="ad-login-card">
          <div className="ad-login-brand">
            <span className="ad-brand-mark">BP</span>
            <h1>Books Paradise</h1>
            <p>Sign in to manage your site</p>
          </div>

          {!isConfigured && (
            <div className="ad-alert ad-alert-warn" style={{ marginBottom: 14 }}>
              <Ic n="alert" style={{ width: 16, height: 16, flex: '0 0 auto', marginTop: 1 }} />
              <span>
                Supabase isn’t configured. Add <code className="ad-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code className="ad-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="ad-mono">.env.local</code>,
                then restart the server.
              </span>
            </div>
          )}

          {error && (
            <div className="ad-alert ad-alert-error" style={{ marginBottom: 14 }}>
              <Ic n="alert" style={{ width: 16, height: 16, flex: '0 0 auto', marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form action={signIn}>
            <input type="hidden" name="next" value={next ?? '/admin'} />
            <div className="ad-field">
              <label className="ad-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="ad-input" autoComplete="username" required autoFocus />
            </div>
            <div className="ad-field">
              <label className="ad-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="ad-input" autoComplete="current-password" required />
            </div>
            <button type="submit" className="ad-btn ad-btn-primary">Sign in</button>
          </form>

          <p className="ad-hint" style={{ marginTop: 16, textAlign: 'center' }}>
            Accounts are created by an owner or admin in Supabase → Authentication → Users.
          </p>
        </div>
      </div>
    </div>
  )
}
