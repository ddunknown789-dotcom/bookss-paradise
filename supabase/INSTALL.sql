-- ===========================================================================
-- Books Paradise CMS — full install
-- Generated 2026-08-05 23:14. Paste this whole file into:
--   Supabase dashboard → SQL Editor → New query → Run
-- Safe to run once on a fresh project.
-- ===========================================================================


-- ─────────────────────────────────────────────────────────────────────────
-- 0001_schema.sql
-- ─────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- Books Paradise CMS — core schema
--
-- Every editable thing on the public site has a row here. The public site
-- reads only `status = 'published'` rows (enforced by RLS in 0002_rls.sql);
-- the admin panel reads and writes everything, gated by the caller's role.
--
-- Conventions:
--   * uuid primary keys, generated server-side
--   * created_at / updated_at on every content table (updated_at via trigger)
--   * sort_order integers for anything a human can reorder in the admin
--   * media is never stored inline — always a FK to media(id)
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type user_role as enum ('owner', 'admin', 'editor');
create type content_status as enum ('draft', 'published', 'archived');
create type media_kind as enum ('image', 'video', 'pdf', 'audio', 'other');
create type review_status as enum ('pending', 'approved', 'hidden');
create type review_source as enum ('editorial', 'reader');
create type taxonomy_type as enum ('genre', 'tag', 'category');
create type book_video_kind as enum ('trailer', 'review', 'summary', 'interview', 'other');
create type book_section_kind as enum ('review', 'summary');
create type review_point_kind as enum ('loved', 'better');
create type seo_entity as enum ('global', 'page', 'book', 'author', 'interview', 'collection');
create type link_target as enum ('_self', '_blank');

-- Homepage/page builder section types. Each maps 1:1 to a React component that
-- already exists on the site — adding a value here means adding a renderer.
create type section_type as enum (
  'intro',
  'hero',
  'videos',
  'top_picks',
  'reviews',
  'book_of_week',
  'interviews',
  'mission',
  'community',
  'offer',
  'newsletter'
);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — one row per auth user, carrying the CMS role
-- ----------------------------------------------------------------------------

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        user_role not null default 'editor',
  is_active   boolean not null default true,
  last_seen_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_role_idx on profiles(role);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- New auth users land here automatically. The very first user becomes the
-- owner so a fresh install is never locked out of its own admin panel.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when is_first then 'owner'::user_role else 'editor'::user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Media library
-- ----------------------------------------------------------------------------

create table media_folders (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references media_folders(id) on delete cascade,
  name        text not null,
  slug        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (parent_id, slug)
);
create trigger media_folders_updated_at before update on media_folders
  for each row execute function set_updated_at();

create table media (
  id            uuid primary key default gen_random_uuid(),
  folder_id     uuid references media_folders(id) on delete set null,
  bucket        text not null default 'media',
  path          text not null,                 -- object path inside the bucket
  filename      text not null,                 -- display name, renameable
  original_name text,
  mime_type     text,
  kind          media_kind not null default 'image',
  size_bytes    bigint,
  width         integer,
  height        integer,
  duration_ms   integer,                       -- video/audio
  alt_text      text,
  caption       text,
  checksum      text,
  uploaded_by   uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (bucket, path)
);
create index media_folder_idx on media(folder_id);
create index media_kind_idx on media(kind);
create index media_created_idx on media(created_at desc);
create index media_search_idx on media using gin (to_tsvector('simple', coalesce(filename,'') || ' ' || coalesce(alt_text,'') || ' ' || coalesce(caption,'')));
create trigger media_updated_at before update on media
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Taxonomy — genres, tags, categories share one table, split by `type`
-- ----------------------------------------------------------------------------

create table categories (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references categories(id) on delete set null,
  type        taxonomy_type not null default 'genre',
  name        text not null,
  slug        text not null,
  description text,
  image_id    uuid references media(id) on delete set null,
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (type, slug)
);
create index categories_type_idx on categories(type, sort_order);
create trigger categories_updated_at before update on categories
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Authors
-- ----------------------------------------------------------------------------

create table authors (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  bio         text,
  photo_id    uuid references media(id) on delete set null,
  website     text,
  socials     jsonb not null default '{}'::jsonb,
  status      content_status not null default 'published',
  sort_order  integer not null default 0,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index authors_status_idx on authors(status);
create trigger authors_updated_at before update on authors
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Books
-- ----------------------------------------------------------------------------

create table books (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  subtitle         text,
  author_id        uuid references authors(id) on delete set null,

  -- media
  cover_id         uuid references media(id) on delete set null,
  cover_3d_id      uuid references media(id) on delete set null,
  about_image_id   uuid references media(id) on delete set null,
  trailer_url      text,
  trailer_media_id uuid references media(id) on delete set null,

  -- copy
  summary          text,          -- short "summaryBody"
  description      text,          -- long "about"
  summary_lines    text[] not null default '{}',
  pull_quote_lines text[] not null default '{}',

  -- bibliographic
  primary_genre    text,
  pages            integer,
  isbn             text,
  language         text default 'English',
  publisher        text,
  publication_date date,
  published_label  text,          -- display string, e.g. "Jan 12, 2023"

  -- ratings
  rating           numeric(3,2),
  review_count     integer not null default 0,
  review_excerpt   text,
  review_overall   numeric(3,2),

  -- editorial
  status           content_status not null default 'draft',
  featured         boolean not null default false,
  verified         boolean not null default true,
  sort_order       integer not null default 0,
  published_at     timestamptz,

  created_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index books_status_idx on books(status, sort_order);
create index books_author_idx on books(author_id);
create index books_featured_idx on books(featured) where featured;
create index books_pubdate_idx on books(publication_date desc nulls last);
create index books_search_idx on books using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(subtitle,'') || ' ' || coalesce(description,''))
);
create trigger books_updated_at before update on books
  for each row execute function set_updated_at();

-- genres / tags
create table book_categories (
  book_id     uuid not null references books(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  sort_order  integer not null default 0,
  primary key (book_id, category_id)
);
create index book_categories_cat_idx on book_categories(category_id);

-- gallery + extra imagery
create table book_media (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references books(id) on delete cascade,
  media_id   uuid not null references media(id) on delete cascade,
  role       text not null default 'gallery',   -- gallery | hero | about
  sort_order integer not null default 0
);
create index book_media_book_idx on book_media(book_id, sort_order);

-- per-book videos (trailer, video review, video summary, …)
create table book_videos (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid not null references books(id) on delete cascade,
  kind         book_video_kind not null default 'other',
  label        text not null,
  caption      text,
  duration     text,
  video_url    text,
  media_id     uuid references media(id) on delete set null,
  thumb_id     uuid references media(id) on delete set null,
  sort_order   integer not null default 0
);
create index book_videos_book_idx on book_videos(book_id, sort_order);

-- "What makes it special" cards
create table book_features (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references books(id) on delete cascade,
  icon       text not null default 'spark',
  title      text not null,
  text       text,
  sort_order integer not null default 0
);
create index book_features_book_idx on book_features(book_id, sort_order);

-- pull quotes / page quotes
create table book_quotes (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid references books(id) on delete cascade,
  text       text not null,
  attribution text,
  sort_order integer not null default 0
);
create index book_quotes_book_idx on book_quotes(book_id, sort_order);

-- retailer buttons
create table book_retailers (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references books(id) on delete cascade,
  name       text not null,
  mark       text,
  tone       text,
  url        text,
  cta        text,
  sort_order integer not null default 0
);
create index book_retailers_book_idx on book_retailers(book_id, sort_order);

-- long-form /review and /summary pages: intro + body sections
create table book_sections (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references books(id) on delete cascade,
  kind       book_section_kind not null,
  heading    text,
  body       text not null,
  sort_order integer not null default 0
);
create index book_sections_book_idx on book_sections(book_id, kind, sort_order);

-- the intro paragraphs, verdict, quote and score bars for those pages
create table book_long_pages (
  book_id    uuid not null references books(id) on delete cascade,
  kind       book_section_kind not null,
  intro      text[] not null default '{}',
  verdict    text,
  quote      text,
  bars       jsonb not null default '[]'::jsonb,      -- [{label, value}]
  takeaways  jsonb not null default '[]'::jsonb,      -- [{icon, title, text}]
  updated_at timestamptz not null default now(),
  primary key (book_id, kind)
);
create trigger book_long_pages_updated_at before update on book_long_pages
  for each row execute function set_updated_at();

-- "what worked / what could be better" bullets
create table book_review_points (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references books(id) on delete cascade,
  kind       review_point_kind not null,
  text       text not null,
  sort_order integer not null default 0
);
create index book_review_points_book_idx on book_review_points(book_id, kind, sort_order);

-- "More books you'll love"
create table book_related (
  book_id         uuid not null references books(id) on delete cascade,
  related_book_id uuid not null references books(id) on delete cascade,
  sort_order      integer not null default 0,
  primary key (book_id, related_book_id),
  check (book_id <> related_book_id)
);

-- ----------------------------------------------------------------------------
-- Reader / editorial reviews (moderated)
-- ----------------------------------------------------------------------------

create table reviews (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid references books(id) on delete cascade,
  source       review_source not null default 'reader',
  status       review_status not null default 'pending',
  author_name  text not null,
  author_email text,
  avatar_id    uuid references media(id) on delete set null,
  rating       numeric(2,1),
  title        text,
  body         text not null,
  featured     boolean not null default false,
  sort_order   integer not null default 0,
  approved_by  uuid references profiles(id) on delete set null,
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index reviews_book_idx on reviews(book_id, status);
create index reviews_status_idx on reviews(status, created_at desc);
create trigger reviews_updated_at before update on reviews
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Author interviews
-- ----------------------------------------------------------------------------

create table interviews (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  book_id    uuid references books(id) on delete set null,
  author_id  uuid references authors(id) on delete set null,
  image_id   uuid references media(id) on delete set null,
  intro      text,
  minutes    text,
  published_label text,
  published_on date,
  status     content_status not null default 'draft',
  featured   boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index interviews_status_idx on interviews(status, published_on desc nulls last);
create trigger interviews_updated_at before update on interviews
  for each row execute function set_updated_at();

create table interview_qa (
  id           uuid primary key default gen_random_uuid(),
  interview_id uuid not null references interviews(id) on delete cascade,
  question     text not null,
  answer       text not null,
  sort_order   integer not null default 0
);
create index interview_qa_idx on interview_qa(interview_id, sort_order);

-- ----------------------------------------------------------------------------
-- Book of the Week
-- ----------------------------------------------------------------------------

create table weeks (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  label       text not null,
  range_label text,
  starts_on   date,
  ends_on     date,
  status      content_status not null default 'published',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index weeks_order_idx on weeks(sort_order);
create trigger weeks_updated_at before update on weeks
  for each row execute function set_updated_at();

-- A week entry may point at a real book, or stand alone with its own copy.
create table week_books (
  id              uuid primary key default gen_random_uuid(),
  week_id         uuid not null references weeks(id) on delete cascade,
  book_id         uuid references books(id) on delete set null,
  title           text not null,
  author          text,
  genre           text,
  pages           integer,
  published_label text,
  cover_id        uuid references media(id) on delete set null,
  sort_order      integer not null default 0
);
create index week_books_week_idx on week_books(week_id, sort_order);

-- ----------------------------------------------------------------------------
-- Video content cards ("Stories Brought to Life")
-- ----------------------------------------------------------------------------

create table videos (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  icon         text not null default 'camera',
  screen_label text,
  title        text not null,
  description  text,
  cta_label    text,
  cta_href     text,
  thumb_id     uuid references media(id) on delete set null,
  video_url    text,
  media_id     uuid references media(id) on delete set null,
  status       content_status not null default 'published',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index videos_order_idx on videos(status, sort_order);
create trigger videos_updated_at before update on videos
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- "What We Offer" service cards
-- ----------------------------------------------------------------------------

create table services (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  glyph       text not null default 'social',
  title_lines text[] not null default '{}',
  description text,
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger services_updated_at before update on services
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Pages + section builder
-- ----------------------------------------------------------------------------

create table pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,          -- 'home', 'books', …
  title      text not null,
  status     content_status not null default 'published',
  is_system  boolean not null default false, -- system pages can't be deleted
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pages_updated_at before update on pages
  for each row execute function set_updated_at();

-- Each row is one section of a page. `content` holds the section's editable
-- fields; its shape is typed per `type` in lib/cms/sections.ts.
create table page_sections (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references pages(id) on delete cascade,
  type       section_type not null,
  name       text,                                   -- admin-facing label
  content    jsonb not null default '{}'::jsonb,
  visible    boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, type)
);
create index page_sections_page_idx on page_sections(page_id, sort_order);
create trigger page_sections_updated_at before update on page_sections
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Navigation menus
-- ----------------------------------------------------------------------------

create table menus (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,     -- 'primary', 'footer_pages', …
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger menus_updated_at before update on menus
  for each row execute function set_updated_at();

create table menu_items (
  id         uuid primary key default gen_random_uuid(),
  menu_id    uuid not null references menus(id) on delete cascade,
  parent_id  uuid references menu_items(id) on delete cascade,
  label      text not null,
  href       text not null,
  target     link_target not null default '_self',
  visible    boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_menu_idx on menu_items(menu_id, sort_order);
create trigger menu_items_updated_at before update on menu_items
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Social links (footer + contact)
-- ----------------------------------------------------------------------------

create table social_links (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null,
  label      text,
  url        text not null,
  icon       text,
  visible    boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger social_links_updated_at before update on social_links
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- SEO — one row per entity, plus a single 'global' row for defaults
-- ----------------------------------------------------------------------------

create table seo_meta (
  id              uuid primary key default gen_random_uuid(),
  entity_type     seo_entity not null,
  entity_id       uuid,                       -- null for 'global'
  title           text,
  description     text,
  canonical_url   text,
  robots_noindex  boolean not null default false,
  robots_nofollow boolean not null default false,
  og_title        text,
  og_description  text,
  og_type         text default 'website',
  og_image_id     uuid references media(id) on delete set null,
  twitter_card    text default 'summary_large_image',
  twitter_site    text,
  twitter_creator text,
  structured_data jsonb,
  keywords        text[],
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index seo_meta_entity_idx on seo_meta(entity_type, coalesce(entity_id, '00000000-0000-0000-0000-000000000000'::uuid));
create trigger seo_meta_updated_at before update on seo_meta
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Global settings — grouped key/value, typed on the client
-- ----------------------------------------------------------------------------

create table settings (
  key         text primary key,
  group_name  text not null default 'general',
  label       text,
  value       jsonb not null default 'null'::jsonb,
  updated_by  uuid references profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);
create index settings_group_idx on settings(group_name);
create trigger settings_updated_at before update on settings
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Newsletter subscribers
-- ----------------------------------------------------------------------------

create table subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  status        text not null default 'subscribed',
  source        text,
  created_at    timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ----------------------------------------------------------------------------
-- Audit log — who changed what, for a multi-editor CMS
-- ----------------------------------------------------------------------------

create table audit_log (
  id          bigserial primary key,
  actor_id    uuid references profiles(id) on delete set null,
  actor_email text,
  action      text not null,          -- create | update | delete | publish | …
  entity      text not null,          -- table name
  entity_id   text,
  summary     text,
  diff        jsonb,
  created_at  timestamptz not null default now()
);
create index audit_log_created_idx on audit_log(created_at desc);
create index audit_log_entity_idx on audit_log(entity, entity_id);


-- ─────────────────────────────────────────────────────────────────────────
-- 0002_rls.sql
-- ─────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- Row Level Security
--
-- Two audiences:
--   anon / public site  — may read PUBLISHED content only, and may insert a
--                         newsletter signup or a pending review. Nothing else.
--   staff (profiles)    — role decides how far write access reaches:
--                           editor → content
--                           admin  → content + structure + SEO + settings + users
--                           owner  → everything, including other owners
--
-- The service-role key bypasses RLS entirely; it is used only in server-side
-- admin actions that have already checked the caller's role.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

-- security definer so a caller can read their own role without needing a
-- select policy on profiles first (which would recurse).
create or replace function cms_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active limit 1;
$$;

create or replace function cms_rank(r user_role)
returns integer
language sql
immutable
as $$
  select case r when 'owner' then 3 when 'admin' then 2 when 'editor' then 1 else 0 end;
$$;

-- "caller is signed in, active staff, and at least this role"
create or replace function cms_at_least(min_role user_role)
returns boolean
language sql
stable
as $$
  select cms_rank(cms_role()) >= cms_rank(min_role);
$$;

create or replace function is_editor() returns boolean language sql stable as $$
  select cms_at_least('editor');
$$;

create or replace function is_admin() returns boolean language sql stable as $$
  select cms_at_least('admin');
$$;

create or replace function is_owner() returns boolean language sql stable as $$
  select cms_at_least('owner');
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS everywhere
-- ----------------------------------------------------------------------------

alter table profiles          enable row level security;
alter table media_folders     enable row level security;
alter table media             enable row level security;
alter table categories        enable row level security;
alter table authors           enable row level security;
alter table books             enable row level security;
alter table book_categories   enable row level security;
alter table book_media        enable row level security;
alter table book_videos       enable row level security;
alter table book_features     enable row level security;
alter table book_quotes       enable row level security;
alter table book_retailers    enable row level security;
alter table book_sections     enable row level security;
alter table book_long_pages   enable row level security;
alter table book_review_points enable row level security;
alter table book_related      enable row level security;
alter table reviews           enable row level security;
alter table interviews        enable row level security;
alter table interview_qa      enable row level security;
alter table weeks             enable row level security;
alter table week_books        enable row level security;
alter table videos            enable row level security;
alter table services          enable row level security;
alter table pages             enable row level security;
alter table page_sections     enable row level security;
alter table menus             enable row level security;
alter table menu_items        enable row level security;
alter table social_links      enable row level security;
alter table seo_meta          enable row level security;
alter table settings          enable row level security;
alter table subscribers       enable row level security;
alter table audit_log         enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

create policy profiles_self_read on profiles
  for select using (id = auth.uid() or is_admin());

create policy profiles_self_update on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles p where p.id = auth.uid()));

-- Admins manage staff; only an owner may create or touch another owner.
create policy profiles_admin_insert on profiles
  for insert with check (is_admin() and (role <> 'owner' or is_owner()));

create policy profiles_admin_update on profiles
  for update using (is_admin() and (role <> 'owner' or is_owner()))
  with check (is_admin() and (role <> 'owner' or is_owner()));

create policy profiles_owner_delete on profiles
  for delete using (is_owner() and id <> auth.uid());

-- ----------------------------------------------------------------------------
-- Content readable by the public when published; editors read everything.
-- One pair of policies per table keeps the intent obvious at a glance.
-- ----------------------------------------------------------------------------

-- books
create policy books_public_read on books
  for select using (status = 'published' or is_editor());
create policy books_staff_write on books
  for all using (is_editor()) with check (is_editor());

-- authors
create policy authors_public_read on authors
  for select using (status = 'published' or is_editor());
create policy authors_staff_write on authors
  for all using (is_editor()) with check (is_editor());

-- interviews
create policy interviews_public_read on interviews
  for select using (status = 'published' or is_editor());
create policy interviews_staff_write on interviews
  for all using (is_editor()) with check (is_editor());

create policy interview_qa_public_read on interview_qa
  for select using (
    exists (select 1 from interviews i where i.id = interview_id and (i.status = 'published' or is_editor()))
  );
create policy interview_qa_staff_write on interview_qa
  for all using (is_editor()) with check (is_editor());

-- weeks
create policy weeks_public_read on weeks
  for select using (status = 'published' or is_editor());
create policy weeks_staff_write on weeks
  for all using (is_editor()) with check (is_editor());

create policy week_books_public_read on week_books
  for select using (
    exists (select 1 from weeks w where w.id = week_id and (w.status = 'published' or is_editor()))
  );
create policy week_books_staff_write on week_books
  for all using (is_editor()) with check (is_editor());

-- videos
create policy videos_public_read on videos
  for select using (status = 'published' or is_editor());
create policy videos_staff_write on videos
  for all using (is_editor()) with check (is_editor());

-- services
create policy services_public_read on services
  for select using (visible or is_editor());
create policy services_staff_write on services
  for all using (is_editor()) with check (is_editor());

-- categories
create policy categories_public_read on categories
  for select using (visible or is_editor());
create policy categories_staff_write on categories
  for all using (is_editor()) with check (is_editor());

-- ----------------------------------------------------------------------------
-- Book child tables — visibility follows the parent book
-- ----------------------------------------------------------------------------

create or replace function book_is_visible(b uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from books where id = b and (status = 'published' or is_editor())
  );
$$;

create policy book_categories_read on book_categories
  for select using (book_is_visible(book_id));
create policy book_categories_write on book_categories
  for all using (is_editor()) with check (is_editor());

create policy book_media_read on book_media
  for select using (book_is_visible(book_id));
create policy book_media_write on book_media
  for all using (is_editor()) with check (is_editor());

create policy book_videos_read on book_videos
  for select using (book_is_visible(book_id));
create policy book_videos_write on book_videos
  for all using (is_editor()) with check (is_editor());

create policy book_features_read on book_features
  for select using (book_is_visible(book_id));
create policy book_features_write on book_features
  for all using (is_editor()) with check (is_editor());

create policy book_quotes_read on book_quotes
  for select using (book_id is null or book_is_visible(book_id));
create policy book_quotes_write on book_quotes
  for all using (is_editor()) with check (is_editor());

create policy book_retailers_read on book_retailers
  for select using (book_is_visible(book_id));
create policy book_retailers_write on book_retailers
  for all using (is_editor()) with check (is_editor());

create policy book_sections_read on book_sections
  for select using (book_is_visible(book_id));
create policy book_sections_write on book_sections
  for all using (is_editor()) with check (is_editor());

create policy book_long_pages_read on book_long_pages
  for select using (book_is_visible(book_id));
create policy book_long_pages_write on book_long_pages
  for all using (is_editor()) with check (is_editor());

create policy book_review_points_read on book_review_points
  for select using (book_is_visible(book_id));
create policy book_review_points_write on book_review_points
  for all using (is_editor()) with check (is_editor());

create policy book_related_read on book_related
  for select using (book_is_visible(book_id));
create policy book_related_write on book_related
  for all using (is_editor()) with check (is_editor());

-- ----------------------------------------------------------------------------
-- Reviews — the public may submit one, but only approved ones are readable
-- and a visitor can never set their own status.
-- ----------------------------------------------------------------------------

create policy reviews_public_read on reviews
  for select using (status = 'approved' or is_editor());

create policy reviews_public_submit on reviews
  for insert to anon, authenticated
  with check (status = 'pending' and source = 'reader' and featured = false);

create policy reviews_staff_write on reviews
  for all using (is_editor()) with check (is_editor());

-- ----------------------------------------------------------------------------
-- Media — public read (files are served from a public bucket anyway),
-- editors upload and manage.
-- ----------------------------------------------------------------------------

create policy media_public_read on media for select using (true);
create policy media_staff_write on media
  for all using (is_editor()) with check (is_editor());

create policy media_folders_public_read on media_folders for select using (true);
create policy media_folders_staff_write on media_folders
  for all using (is_editor()) with check (is_editor());

-- ----------------------------------------------------------------------------
-- Site structure — editors may edit page CONTENT; only admins may change
-- navigation, footer links and page structure.
-- ----------------------------------------------------------------------------

create policy pages_public_read on pages
  for select using (status = 'published' or is_editor());
create policy pages_admin_write on pages
  for all using (is_admin()) with check (is_admin());

create policy page_sections_public_read on page_sections
  for select using (
    visible and exists (select 1 from pages p where p.id = page_id and p.status = 'published')
    or is_editor()
  );
-- editors change what a section says; admins add, remove and reorder them
create policy page_sections_editor_update on page_sections
  for update using (is_editor()) with check (is_editor());
create policy page_sections_admin_insert on page_sections
  for insert with check (is_admin());
create policy page_sections_admin_delete on page_sections
  for delete using (is_admin());

create policy menus_public_read on menus for select using (true);
create policy menus_admin_write on menus
  for all using (is_admin()) with check (is_admin());

create policy menu_items_public_read on menu_items
  for select using (visible or is_editor());
create policy menu_items_admin_write on menu_items
  for all using (is_admin()) with check (is_admin());

create policy social_links_public_read on social_links
  for select using (visible or is_editor());
create policy social_links_admin_write on social_links
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- SEO + settings — readable by the site, writable by admins
-- ----------------------------------------------------------------------------

create policy seo_meta_public_read on seo_meta for select using (true);
create policy seo_meta_admin_write on seo_meta
  for all using (is_admin()) with check (is_admin());

create policy settings_public_read on settings for select using (true);
create policy settings_admin_write on settings
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- Subscribers — anyone may sign up, only staff may read the list
-- ----------------------------------------------------------------------------

create policy subscribers_insert on subscribers
  for insert to anon, authenticated with check (true);
create policy subscribers_staff_read on subscribers
  for select using (is_editor());
create policy subscribers_admin_write on subscribers
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- Audit log — append-only, staff-readable
-- ----------------------------------------------------------------------------

create policy audit_log_staff_read on audit_log
  for select using (is_editor());
create policy audit_log_staff_insert on audit_log
  for insert with check (is_editor());


-- ─────────────────────────────────────────────────────────────────────────
-- 0003_storage.sql
-- ─────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- Supabase Storage — buckets and access rules for the media library.
--
-- One public bucket ('media'). Public read is intentional: these are the
-- images and videos the website serves, and a public bucket lets the CDN
-- cache them without signed-URL round trips. Writes are staff-only.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  524288000, -- 500 MB, enough for book trailers
  array[
    'image/jpeg','image/png','image/webp','image/avif','image/gif','image/svg+xml',
    'video/mp4','video/webm','video/quicktime',
    'audio/mpeg','audio/wav','audio/ogg',
    'application/pdf'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read the served files.
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Only signed-in staff may upload, replace or remove them.
create policy "media staff insert"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_editor());

create policy "media staff update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_editor())
  with check (bucket_id = 'media' and public.is_editor());

create policy "media staff delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_editor());


-- ─────────────────────────────────────────────────────────────────────────
-- 0004_defaults.sql
-- ─────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- Default site structure and copy.
--
-- Everything here is the CURRENT live wording of the site, moved verbatim out
-- of the React components so that the first load after migration is visually
-- identical. Editing any of it in /admin changes the site; nothing here is
-- referenced from code by value, only by key.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Pages
-- ----------------------------------------------------------------------------

insert into pages (slug, title, status, is_system) values
  ('home',              'Home',              'published', true),
  ('books',             'All Books',         'published', true),
  ('books-of-the-week', 'Book of the Week',  'published', true)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Homepage sections — order matches the current App.jsx render order
-- ----------------------------------------------------------------------------

with home as (select id from pages where slug = 'home')
insert into page_sections (page_id, type, name, sort_order, visible, content)
select home.id, s.type::section_type, s.name, s.sort_order, true, s.content::jsonb
from home, (values
  ('intro', 'Intro / Brand Badge', 0, '{
    "enabled": true,
    "cueLabel": "Scroll"
  }'),

  ('hero', 'Hero', 1, '{
    "headingLines": ["Stories That Stay", "With You Forever"],
    "subheading": "Dive into handpicked books, cinematic trailers, honest reviews, and a community that lives for stories.",
    "primaryCta":   { "label": "Explore Now", "href": "#books" },
    "secondaryCta": { "label": "Learn More",  "href": "#about" },
    "dividerWidth": 430,
    "showArt": true
  }'),

  ('videos', 'Stories Brought to Life', 2, '{
    "kicker": "Explore Our Video Content",
    "heading": "Stories Brought to Life",
    "subheading": "Dive deeper into the books you love through our immersive video content."
  }'),

  ('top_picks', 'Top Picks for You', 3, '{
    "heading": "Top Picks for You",
    "cta": { "label": "View All Books", "href": "/books" },
    "limit": 12,
    "shelfImage": "/assets/shelf.png"
  }'),

  ('reviews', 'Latest Book Reviews', 4, '{
    "heading": "Latest Book Reviews",
    "cta": { "label": "Read More Reviews", "href": "#reviews" },
    "limit": 6,
    "readMoreLabel": "Read Full Review"
  }'),

  ('book_of_week', 'Book of the Week', 5, '{
    "heading": "Book of the Week",
    "subheading": "Handpicked stories that stay with you long after the last page.",
    "cta": { "label": "See Every Week", "href": "/books-of-the-week" }
  }'),

  ('interviews', 'Author Interviews', 6, '{
    "heading": "Author Interviews",
    "subheading": "Conversations with the writers behind the books you love.",
    "cta": { "label": "View All Interviews", "href": "#interviews" },
    "limit": 4
  }'),

  ('mission', 'Our Mission', 7, '{
    "heading": "Our Mission",
    "body": "Books Paradise is more than just a page – it’s a paradise for readers. Our mission is to connect people with stories that inspire, heal, and transform.",
    "image": "/assets/model/model-mission.png",
    "imageAlt": "Reader sitting beside stacks of classic books",
    "stats": [
      { "target": 10,  "suffix": "K+", "label": "Happy Readers" },
      { "target": 500, "suffix": "+",  "label": "Books Featured" },
      { "target": 100, "suffix": "+",  "label": "Authors Spotlighted" }
    ]
  }'),

  ('community', 'A Community That Reads Together', 8, '{
    "headingLines": ["A Community", "That Reads", "Together"],
    "body": "Join thousands of book lovers who share recommendations, thoughts, and love for stories.",
    "cta": { "label": "Join Our Community", "href": "#newsletter" },
    "image": "/assets/model/model-community.png",
    "imageAlt": "Gold-framed portraits of readers arranged on a circular podium"
  }'),

  ('offer', 'What We Offer', 9, '{
    "kicker": "Explore Our Services",
    "heading": "What We Offer",
    "subheadingLines": [
      "Premium book promotion and content services",
      "designed to bring stories to life."
    ],
    "footerText": "Stories connect. We make them unforgettable."
  }'),

  ('newsletter', 'Stay in the Loop', 10, '{
    "heading": "Stay in the Loop",
    "body": "Get the latest book updates, trailers, reviews, and recommendations straight to your inbox.",
    "placeholder": "Your email address",
    "submitLabel": "Subscribe",
    "successLabel": "Subscribed ✓",
    "image": "/assets/model/model-news.png",
    "imageAlt": "Reader writing with a quill at a desk while a green envelope floats above"
  }')
) as s(type, name, sort_order, content)
on conflict (page_id, type) do nothing;

-- ----------------------------------------------------------------------------
-- Navigation
-- ----------------------------------------------------------------------------

insert into menus (key, name) values
  ('primary', 'Primary Navigation'),
  ('footer_pages', 'Footer — Pages'),
  ('footer_explore', 'Footer — Explore')
on conflict (key) do nothing;

with m as (select id from menus where key = 'primary')
insert into menu_items (menu_id, label, href, sort_order)
select m.id, v.label, v.href, v.sort_order
from m, (values
  ('Home',      '/#home',      0),
  ('Books',     '/#books',     1),
  ('Reviews',   '/#reviews',   2),
  ('Trailers',  '/#trailers',  3),
  ('Community', '/#community', 4),
  ('About',     '/#about',     5)
) as v(label, href, sort_order)
on conflict do nothing;

with m as (select id from menus where key = 'footer_pages')
insert into menu_items (menu_id, label, href, sort_order)
select m.id, v.label, v.href, v.sort_order
from m, (values
  ('All Books',         '/books',              0),
  ('Book of the Week',  '/books-of-the-week',  1),
  ('Author Interviews', '/#interviews',        2),
  ('What We Offer',     '/#offer',             3)
) as v(label, href, sort_order)
on conflict do nothing;

with m as (select id from menus where key = 'footer_explore')
insert into menu_items (menu_id, label, href, sort_order)
select m.id, v.label, v.href, v.sort_order
from m, (values
  ('Reviews',   '/#reviews',   0),
  ('Trailers',  '/#trailers',  1),
  ('Community', '/#community', 2),
  ('About Us',  '/#about',     3)
) as v(label, href, sort_order)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Social links
-- ----------------------------------------------------------------------------

insert into social_links (platform, label, url, icon, sort_order) values
  ('instagram', 'Instagram', 'https://instagram.com/bookss.paradise', 'instagram', 0),
  ('facebook',  'Facebook',  'https://facebook.com',                  'facebook',  1),
  ('youtube',   'YouTube',   'https://youtube.com',                   'youtube',   2)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Video content cards
-- ----------------------------------------------------------------------------

insert into videos (key, icon, screen_label, title, description, cta_label, cta_href, sort_order) values
  ('review',  'camera',  'Book Review',  'Video Book Review',
   'In-depth video reviews with honest opinions and detailed analysis of your favorite books.',
   'Watch Reviews', '#reviews', 0),
  ('summary', 'book',    'Book Summary', 'Video Book Summary',
   'Quick, engaging summaries that capture the essence of each book in minutes.',
   'Watch Summaries', '#books', 1),
  ('trailer', 'clapper', 'Book Trailer', 'Cinematic Book Trailer',
   'Cinematic trailers that bring the world of each book to life on screen.',
   'Watch Trailers', '#trailers', 2)
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- "What We Offer" service cards
-- ----------------------------------------------------------------------------

insert into services (key, glyph, title_lines, description, sort_order) values
  ('social',        'social',        array['Book Features on','Instagram, FB,','Website & YouTube'],
   'Showcase your book to a wider audience across top platforms and drive real engagement.', 0),
  ('reviews',       'pen',           array['Honest','Book Reviews'],
   'Genuine, in-depth reviews that build trust and help readers make their next favorite read.', 1),
  ('video',         'film',          array['Cinematic','Video Content','of Book'],
   'High-quality, cinematic videos that capture your book’s essence and leave a lasting impression.', 2),
  ('website',       'website',       array['Website','Creation'],
   'Professional, author-focused websites that establish your online presence and connect you with readers.', 3),
  ('author',        'author',        array['Author','Features'],
   'Highlighting authors, their journey, and their stories to connect with readers on a deeper level.', 4),
  ('blogs',         'blog',          array['Book','Blogs'],
   'Engaging blog posts that inform, inspire, and bring more visibility to your book and brand.', 5)
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- Global settings
-- ----------------------------------------------------------------------------

insert into settings (key, group_name, label, value) values
  ('site.name',        'general', 'Site name',        '"Books Paradise"'),
  ('site.tagline',     'general', 'Tagline',          '"Stories That Stay With You Forever"'),
  ('site.url',         'general', 'Site URL',         '"https://bookssparadise.com"'),
  ('site.logo',        'general', 'Logo',             '"/assets/logo.png"'),
  ('site.favicon',     'general', 'Favicon',          '"/icon.png"'),

  ('contact.email',    'contact', 'Contact email',    '"contact@bookssparadise.com"'),
  ('contact.phone',    'contact', 'Contact phone',    '""'),
  ('contact.address',  'contact', 'Address',          '""'),

  ('footer.blurb',     'footer',  'Footer blurb',
   '"A paradise for readers — handpicked books, cinematic trailers, honest reviews and the people who love them."'),
  ('footer.copyright', 'footer',  'Copyright line',   '"© {year} Books Paradise. All Rights Reserved."'),
  ('footer.newsletterHeading', 'footer', 'Footer newsletter heading', '"Stay in the Loop"'),
  ('footer.newsletterBody',    'footer', 'Footer newsletter body',
   '"New reviews, trailers and weekly picks — straight to your inbox."'),

  ('seo.titleTemplate','seo',     'Title template',   '"%s | Books Paradise"'),
  ('seo.defaultTitle', 'seo',     'Default title',    '"Books Paradise — Stories That Stay With You Forever"'),
  ('seo.defaultDescription', 'seo', 'Default description',
   '"Handpicked books, cinematic trailers, honest reviews, and a community that lives for stories."'),
  ('seo.robotsExtra',  'seo',     'Extra robots.txt rules', '""'),
  ('seo.indexingEnabled', 'seo',  'Allow search engines', 'true'),

  ('features.chatEnabled',    'features', 'BP assistant',       'true'),
  ('features.voiceEnabled',   'features', 'Assistant voice',    'true'),
  ('features.splashCursor',   'features', 'Fluid cursor',       'true'),
  ('features.particleField',  'features', 'Particle field',     'true'),
  ('features.loader',         'features', 'Intro loader',       'true')
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- Global SEO row
-- ----------------------------------------------------------------------------

insert into seo_meta (entity_type, entity_id, title, description, og_type, twitter_card)
values (
  'global', null,
  'Books Paradise — Stories That Stay With You Forever',
  'Handpicked books, cinematic trailers, honest reviews, and a community that lives for stories.',
  'website',
  'summary_large_image'
)
on conflict do nothing;



-- ─────────────────────────────────────────────────────────────────────────
-- 0005_intro_socials.sql
-- ─────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- Social accounts shown under the intro logo
--
-- The homepage intro now renders Instagram, Facebook and YouTube beneath the
-- badge and takes their URLs from this table, so an editor can set or change a
-- link under /admin/footer → Social accounts without a deploy. Two rows had to
-- change for that to work:
--
--   * facebook still carried the guessed handle URL seeded in 0004. That was
--     never a confirmed account and 404s; point it at the real page.
--   * youtube had no row at all, so there was nothing for an editor to fill in.
--     Add it with an empty URL. The intro shows an account with no URL as plain
--     text — visible, but never a link to nowhere — so the row is safe to carry
--     until the channel URL is known.
--
-- Both statements are guarded, so re-running this never clobbers a URL an
-- editor has already set by hand.
-- ============================================================================

update social_links
   set url = 'https://www.facebook.com/share/1912T1r9Xs/?mibextid=wwXIfr'
 where platform = 'facebook'
   and url in ('https://facebook.com', 'https://www.facebook.com/bookssparadise');

-- youtube sits third in the row, so twitter moves down to make room
update social_links set sort_order = 3 where platform = 'twitter' and sort_order = 2;

insert into social_links (platform, label, url, icon, sort_order)
select 'youtube', 'YouTube', '', 'youtube', 2
 where not exists (select 1 from social_links where platform = 'youtube');


-- ─────────────────────────────────────────────────────────────────────────
-- 0006_watch_galleries.sql
-- ─────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- The three "Watch" gallery pages
--
-- Until now the three cards under "Stories Brought to Life" scrolled to an
-- anchor on the home page. Each one now opens a page of its own — /watch/
-- reviews, /watch/summaries and /watch/trailers — and this table is what those
-- pages list.
--
-- One row is one video. It plays from whichever source is filled in:
--
--   * video_url  — a YouTube link in any shape (watch, youtu.be, Shorts, live
--                  or embed). It is embedded and plays inside the site, so a
--                  click never hands the visitor over to YouTube.
--   * media_id   — a file uploaded to the Media Library, played by the
--                  browser's own video element.
--
-- video_url wins when both are set, so a row can be pointed at YouTube without
-- first detaching the file it used to play.
--
-- `aspect` is what keeps a gallery of mixed shapes from tearing: the page
-- reserves each card's exact ratio before anything loads. 'auto' means "work it
-- out" — an uploaded file already carries its pixel dimensions, and a Shorts
-- link is vertical by definition — and is right for nearly every row. The
-- explicit values exist for the one case nothing can infer: a plain YouTube
-- link to a video that isn't 16:9.
--
-- `published_at` is optional and does two jobs at once: it dates the card and
-- it fills schema.org's `uploadDate`, without which a video is not eligible
-- for a video rich result. Rows that have no date are simply left out of the
-- structured data rather than given one that was made up.
--
-- Re-running this file is safe.
-- ============================================================================

create table if not exists video_items (
  id           uuid primary key default gen_random_uuid(),
  category     text not null check (category in ('review', 'summary', 'trailer')),
  title        text not null,
  description  text,
  duration     text,                            -- display only, e.g. '8:45'
  published_at date,                            -- when the video went out; shown on the card

  video_url    text,                            -- YouTube link, or any direct file URL
  media_id     uuid references media(id) on delete set null,
  poster_id    uuid references media(id) on delete set null,
  poster_url   text,                            -- overrides the YouTube still
  aspect       text not null default 'auto'
               check (aspect in ('auto', 'landscape', 'wide', 'classic', 'square', 'tall', 'vertical')),
  status       content_status not null default 'published',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists video_items_gallery_idx
  on video_items(category, status, sort_order);

drop trigger if exists video_items_updated_at on video_items;
create trigger video_items_updated_at before update on video_items
  for each row execute function set_updated_at();

-- Same rules as every other content table: anonymous visitors read what is
-- published, staff read and write everything.
alter table video_items enable row level security;

drop policy if exists video_items_public_read on video_items;
create policy video_items_public_read on video_items
  for select using (status = 'published' or is_editor());

drop policy if exists video_items_staff_write on video_items;
create policy video_items_staff_write on video_items
  for all using (is_editor()) with check (is_editor());

-- ----------------------------------------------------------------------------
-- Point the home page cards at their new pages
--
-- Guarded on the old anchor values, so a link an editor has already changed by
-- hand in /admin/videos is left alone.
-- ----------------------------------------------------------------------------

update videos set cta_href = '/watch/reviews'
 where key = 'review'  and coalesce(cta_href, '') in ('', '#', '#reviews');

update videos set cta_href = '/watch/summaries'
 where key = 'summary' and coalesce(cta_href, '') in ('', '#', '#books', '#summaries');

update videos set cta_href = '/watch/trailers'
 where key = 'trailer' and coalesce(cta_href, '') in ('', '#', '#trailers');
