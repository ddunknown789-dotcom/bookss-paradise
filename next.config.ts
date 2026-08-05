import type { NextConfig } from 'next'

/**
 * The Supabase project host is needed for next/image remote patterns. It's
 * derived from the public URL so there's one env var to set, not two.
 */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname
  } catch {
    return null
  }
})()

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
    // The site's art is authored at fixed sizes; these are the widths actually used.
    deviceSizes: [375, 640, 828, 1080, 1280, 1536, 1920],
  },

  // three.js ships untranspiled ESM that the server compiler doesn't need to
  // touch — the 3D scenes are client-only.
  transpilePackages: ['three'],

  eslint: { ignoreDuringBuilds: true },

  async headers() {
    return [
      {
        // Never let a proxy cache a signed-in admin response.
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
      },
    ]
  },
}

export default nextConfig
