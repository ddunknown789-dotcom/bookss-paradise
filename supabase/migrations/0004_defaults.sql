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
  ('site.url',         'general', 'Site URL',         '"https://bookss-paradise.vercel.app"'),
  ('site.logo',        'general', 'Logo',             '"/assets/logo.png"'),
  ('site.favicon',     'general', 'Favicon',          '"/favicon.ico"'),

  ('contact.email',    'contact', 'Contact email',    '""'),
  ('contact.phone',    'contact', 'Contact phone',    '""'),
  ('contact.address',  'contact', 'Address',          '""'),

  ('footer.blurb',     'footer',  'Footer blurb',
   '"A paradise for readers — handpicked books, cinematic trailers, honest reviews and the people who love them."'),
  ('footer.copyright', 'footer',  'Copyright line',   '"© {year} Books Paradise. All rights reserved."'),
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
