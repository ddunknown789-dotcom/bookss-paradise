import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Books Paradise Admin' },
  // The admin must never be indexed, whatever the site's SEO settings say.
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Bare wrapper. The signed-in chrome lives in (panel)/layout.tsx so that
 * /admin/login renders outside it — otherwise the auth check in the shell
 * would redirect the login page to itself.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
