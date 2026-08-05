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
