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
