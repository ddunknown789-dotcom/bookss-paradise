# Books Paradise CMS — setup & status

## Where this stands

The migration from Vite/JS to Next.js/TypeScript + Supabase is **in progress**.
Phase 1 (the foundation everything else sits on) is complete and typechecks
cleanly. The public site and admin panel are not yet ported — see *Remaining*
below.

**The site does not currently run.** Vite has been removed from `package.json`
and the Next.js app has no pages yet. The original Vite source is untouched in
`src/` and is the reference for the port (and the source for the seed script).

---

## What you need to do (5 minutes)

I can't create accounts, so these steps are yours.

### 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> and create a project.
2. Pick a region close to your visitors.
3. Save the database password somewhere safe.

### 2. Copy the keys

Project → **Settings → API**. You need three values:

| Dashboard label | Goes in `.env.local` as |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

```bash
cp .env.example .env.local
# then paste the three values in
```

> The `service_role` key bypasses every security rule. It belongs only in
> `.env.local` and in your host's server-side environment variables — never in
> a `NEXT_PUBLIC_` variable, never committed, never in the browser.

### 3. Run the migrations

Either paste each file in `supabase/migrations/` into the dashboard's **SQL
Editor** in order, or use the CLI:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

Run them in order — `0001` before `0002`, and so on.

### 4. Import the existing content

```bash
npm run db:seed -- --media
```

This uploads everything in `public/assets` to Storage and imports all 12 books,
their reviews, summaries, features, retailers and videos, plus the author
interviews and the Book of the Week archive. It's idempotent — safe to re-run.

### 5. Create your admin account

Supabase dashboard → **Authentication → Users → Add user**. Use your own email.

**The first account created automatically becomes the Owner.** Every account
after that starts as an Editor, and an Owner or Admin can promote them.

---

## What's built

### Database (`supabase/migrations/`)

| File | Contents |
| --- | --- |
| `0001_schema.sql` | 33 tables, 12 enums, indexes, `updated_at` triggers, auto-profile-on-signup |
| `0002_rls.sql` | Row Level Security on every table + the role helper functions |
| `0003_storage.sql` | The `media` bucket and its access rules |
| `0004_defaults.sql` | Homepage sections, menus, services, video cards and settings — seeded with the site's current wording, verbatim |

Every editable thing on the site has a home: books (with 3D covers, galleries,
videos, quotes, features, retailer links, related titles, and separate
long-form review/summary pages), authors, moderated reviews, interviews with
Q&A, Book of the Week, video cards, service cards, the media library with
folders, taxonomy, navigation menus, social links, per-entity SEO, and grouped
settings. Plus an audit log of who changed what.

### Roles

| | Editor | Admin | Owner |
| --- | :-: | :-: | :-: |
| Books, authors, reviews, videos, interviews, media | ✅ | ✅ | ✅ |
| Homepage section *content* | ✅ | ✅ | ✅ |
| Add/remove/reorder sections, navigation, footer | — | ✅ | ✅ |
| SEO, settings, user management | — | ✅ | ✅ |
| Manage other Owners | — | — | ✅ |

Enforced in three places, so a bug in one doesn't open a hole: middleware
(is there a session), `requireRole()` (does this role qualify), and RLS at the
database (can this user's token actually read/write this row).

### Application layer

- `lib/supabase/` — browser, server, public and service-role clients; hand-written
  types matching the schema (replaced by `npm run db:types` once the project exists)
- `lib/auth.ts` — roles, `requireRole()`, permission map
- `lib/cms/queries.ts` — every read the public site needs, tagged for cache invalidation
- `lib/cms/sections.ts` — typed homepage section schemas + the current copy as defaults
- `lib/cms/metadata.ts` — title/description/canonical/OG/Twitter resolution chain
- `lib/cms/cache.ts` — cache tags; `revalidate()` is what makes "click Save → live" work
- `middleware.ts` — session refresh and the `/admin` gate
- `scripts/seed.ts` — one-shot import of the current content

Queries degrade rather than crash: with no Supabase configured, or if a query
fails in production, pages render with empty data instead of a 500.

---

## Remaining

**Phase 2 — port the frontend** (~25 components + 4 page templates)
Every component moves to `.tsx` with `'use client'`, and reads its content from
`lib/cms/queries.ts` instead of `src/data/*.js`. GSAP, Lenis, Three.js and the
WebGL cursor carry over unchanged — they're already client-side and framework
agnostic. Routes: `/`, `/books`, `/books/[slug]`, `/books/[slug]/review`,
`/books/[slug]/summary`, `/interviews/[slug]`, `/books-of-the-week`.

**Phase 3 — admin shell** — login, layout, dashboard, role-aware navigation

**Phase 4 — admin modules** — books (with draft/publish/archive/duplicate),
authors, reviews moderation, videos, interviews, weeks, categories, homepage
section editor with reorder + hide, navigation, footer, SEO, settings, users

**Phase 5 — media library** — drag & drop, bulk upload, folders, search,
rename, replace, delete

**Phase 6 — SEO plumbing** — `sitemap.ts`, `robots.ts`, JSON-LD, and wiring
`revalidate()` into every save

---

## Verification note

Nothing in Phase 1 has been run against a live database yet — I don't have
project credentials. The SQL is written against PostgreSQL 15 / Supabase
conventions and the TypeScript compiles clean, but the migrations, RLS policies
and seed script need one real run to be called verified. That's the first thing
to do once the keys exist.
