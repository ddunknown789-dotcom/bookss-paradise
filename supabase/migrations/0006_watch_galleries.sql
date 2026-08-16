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
