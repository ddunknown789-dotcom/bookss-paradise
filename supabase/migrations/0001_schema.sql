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
