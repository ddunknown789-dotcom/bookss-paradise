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
