/**
 * SEO audit. Fetches every public page and asserts the things that silently
 * break rich results: stale origins, missing or duplicated tags, malformed
 * JSON-LD, and asset URLs that 404.
 *
 *   npx tsx scripts/seo-audit.ts [baseUrl]
 */
const BASE = process.argv[2] ?? 'http://localhost:5180'
const CANONICAL_HOST = 'bookssparadise.com'

const PAGES = ['/', '/about', '/books', '/books/the-silent-page', '/books/the-silent-page/review',
               '/books-of-the-week', '/interviews/the-silent-page']

let pass = 0
let fail = 0
const ok = (m: string) => { pass++; console.log(`  ✓ ${m}`) }
const bad = (m: string) => { fail++; console.log(`  ✗ ${m}`) }

const one = (html: string, re: RegExp) => [...html.matchAll(re)].map((m) => m[1])

async function auditPage(path: string) {
  console.log(`\n${path}`)
  const res = await fetch(BASE + path)
  if (!res.ok) return bad(`HTTP ${res.status}`)
  const html = await res.text()

  // --- title / description -------------------------------------------------
  const titles = one(html, /<title>([^<]*)<\/title>/g)
  titles.length === 1 && titles[0].trim() ? ok(`title: ${titles[0].slice(0, 58)}`)
    : bad(`title count = ${titles.length}`)

  const descs = one(html, /<meta name="description" content="([^"]*)"/g)
  descs.length === 1 && descs[0].trim() ? ok(`description (${descs[0].length} chars)`)
    : bad(`description count = ${descs.length}`)

  // --- canonical -----------------------------------------------------------
  const canon = one(html, /<link rel="canonical" href="([^"]*)"/g)
  if (canon.length !== 1) bad(`canonical count = ${canon.length}`)
  else if (!canon[0].includes(CANONICAL_HOST)) bad(`canonical wrong host: ${canon[0]}`)
  else ok(`canonical: ${canon[0]}`)

  // --- robots --------------------------------------------------------------
  const robots = one(html, /<meta name="robots" content="([^"]*)"/g)
  robots.length === 1 ? ok(`robots: ${robots[0]}`) : bad(`robots count = ${robots.length}`)

  // --- Open Graph / Twitter ------------------------------------------------
  for (const prop of ['og:title', 'og:description', 'og:url', 'og:site_name', 'og:type']) {
    const v = one(html, new RegExp(`<meta property="${prop}" content="([^"]*)"`, 'g'))
    v.length === 1 && v[0].trim() ? ok(prop) : bad(`${prop} count = ${v.length}`)
  }
  const tw = one(html, /<meta name="twitter:card" content="([^"]*)"/g)
  tw.length === 1 ? ok(`twitter:card: ${tw[0]}`) : bad(`twitter:card count = ${tw.length}`)

  // --- no stale origins ----------------------------------------------------
  const stale = html.match(/https?:\/\/(localhost|127\.0\.0\.1)[:\d]*|bookss-paradise\.vercel\.app/g)
  stale ? bad(`stale origin ×${stale.length}: ${[...new Set(stale)].join(', ')}`) : ok('no localhost / stale origins')

  // --- JSON-LD -------------------------------------------------------------
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  if (!blocks.length) return bad('no JSON-LD')

  const types: string[] = []
  for (const [i, raw] of blocks.entries()) {
    try {
      const parsed = JSON.parse(raw)
      if (!parsed['@context']) bad(`block ${i}: missing @context`)
      const nodes = parsed['@graph'] ?? [parsed]
      for (const n of nodes) {
        if (n?.['@type']) types.push(n['@type'])
        for (const [k, v] of Object.entries(n ?? {})) {
          if (v === '' || v === null) bad(`empty property ${n['@type']}.${k}`)
        }
      }
    } catch (e) {
      bad(`block ${i}: invalid JSON — ${(e as Error).message}`)
    }
  }
  ok(`JSON-LD types: ${types.join(', ')}`)
  return types
}

async function main() {
  console.log(`SEO audit — ${BASE}\n${'='.repeat(60)}`)

  let homeTypes: string[] = []
  for (const page of PAGES) {
    const t = await auditPage(page)
    if (page === '/') homeTypes = (t as string[]) ?? []
  }

  console.log('\nEntity graph')
  for (const t of ['Organization', 'WebSite', 'WebPage']) {
    homeTypes.includes(t) ? ok(`${t} present on home page`) : bad(`${t} missing on home page`)
  }

  console.log('\nsitemap.xml')
  const sm = await (await fetch(BASE + '/sitemap.xml')).text()
  const urls = one(sm, /<loc>([^<]+)<\/loc>/g)
  urls.length ? ok(`${urls.length} URLs`) : bad('empty sitemap')
  urls.every((u) => u.includes(CANONICAL_HOST)) ? ok('all URLs on canonical host') : bad('sitemap has wrong-host URLs')
  urls.some((u) => u.endsWith('/about')) ? ok('/about listed') : bad('/about missing from sitemap')

  console.log('\nrobots.txt')
  const rb = await (await fetch(BASE + '/robots.txt')).text()
  rb.includes(`${CANONICAL_HOST}/sitemap.xml`) ? ok('sitemap points at canonical host') : bad('sitemap line wrong')
  const adminBlocked = /Disallow:\s*\/admin/.test(rb)
  adminBlocked ? ok('/admin disallowed') : bad('/admin not disallowed')

  console.log('\nAssets')
  for (const a of ['/logo.png', '/icon.png', '/apple-icon.png']) {
    const r = await fetch(BASE + a, { method: 'HEAD' })
    r.ok ? ok(`${a} → ${r.status} ${r.headers.get('content-type')}`) : bad(`${a} → ${r.status}`)
  }

  console.log(`\n${'='.repeat(60)}\n${pass} passed, ${fail} failed`)
  if (fail) process.exit(1)
}
main().catch((e) => { console.error(e); process.exit(1) })
