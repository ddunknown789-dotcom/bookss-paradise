import type { Metadata, Viewport } from 'next'

import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/fraunces/900.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/500.css'
import '@fontsource/playfair-display/600.css'
import '@/styles/global.css'

import SmoothScroll from '@/components/SmoothScroll'
import { buildMetadata } from '@/lib/cms/metadata'
import { getSetting } from '@/lib/cms/queries'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ entityType: 'global' })
}

export const viewport: Viewport = {
  themeColor: '#fdfcf9',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSetting<string>('site.language', 'en')

  return (
    <html lang={lang}>
      <body>
        {/* Lenis + ScrollTrigger wiring, exactly as the Vite app had it. */}
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}
