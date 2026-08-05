/**
 * Database types.
 *
 * Hand-maintained to match supabase/migrations/*.sql. Once the project exists,
 * `npm run db:types` regenerates this file from the live schema — that is the
 * source of truth from then on. Until then this keeps the whole app typed.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'owner' | 'admin' | 'editor'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type MediaKind = 'image' | 'video' | 'pdf' | 'audio' | 'other'
export type ReviewStatus = 'pending' | 'approved' | 'hidden'
export type ReviewSource = 'editorial' | 'reader'
export type TaxonomyType = 'genre' | 'tag' | 'category'
export type BookVideoKind = 'trailer' | 'review' | 'summary' | 'interview' | 'other'
export type BookSectionKind = 'review' | 'summary'
export type ReviewPointKind = 'loved' | 'better'
export type SeoEntity = 'global' | 'page' | 'book' | 'author' | 'interview' | 'collection'
export type LinkTarget = '_self' | '_blank'
export type SectionType =
  | 'intro'
  | 'hero'
  | 'videos'
  | 'top_picks'
  | 'reviews'
  | 'book_of_week'
  | 'interviews'
  | 'mission'
  | 'community'
  | 'offer'
  | 'newsletter'

/** Columns every content table carries. */
type Stamps = { created_at: string; updated_at: string }

/** Row -> { Row, Insert, Update } with sensible optionality. */
type Table<Row, Required extends keyof Row = never> = {
  Row: Row
  Insert: Partial<Row> & Pick<Row, Required>
  Update: Partial<Row>
  Relationships: []
}

export type Profile = Stamps & {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  last_seen_at: string | null
}

export type MediaFolder = Stamps & {
  id: string
  parent_id: string | null
  name: string
  slug: string
  sort_order: number
}

export type MediaRow = Stamps & {
  id: string
  folder_id: string | null
  bucket: string
  path: string
  filename: string
  original_name: string | null
  mime_type: string | null
  kind: MediaKind
  size_bytes: number | null
  width: number | null
  height: number | null
  duration_ms: number | null
  alt_text: string | null
  caption: string | null
  checksum: string | null
  uploaded_by: string | null
}

export type Category = Stamps & {
  id: string
  parent_id: string | null
  type: TaxonomyType
  name: string
  slug: string
  description: string | null
  image_id: string | null
  sort_order: number
  visible: boolean
}

export type Author = Stamps & {
  id: string
  slug: string
  name: string
  bio: string | null
  photo_id: string | null
  website: string | null
  socials: Json
  status: ContentStatus
  sort_order: number
  created_by: string | null
}

export type Book = Stamps & {
  id: string
  slug: string
  title: string
  subtitle: string | null
  author_id: string | null
  cover_id: string | null
  cover_3d_id: string | null
  about_image_id: string | null
  trailer_url: string | null
  trailer_media_id: string | null
  summary: string | null
  description: string | null
  summary_lines: string[]
  pull_quote_lines: string[]
  primary_genre: string | null
  pages: number | null
  isbn: string | null
  language: string | null
  publisher: string | null
  publication_date: string | null
  published_label: string | null
  rating: number | null
  review_count: number
  review_excerpt: string | null
  review_overall: number | null
  status: ContentStatus
  featured: boolean
  verified: boolean
  sort_order: number
  published_at: string | null
  created_by: string | null
}

export type BookCategory = {
  book_id: string
  category_id: string
  sort_order: number
}

export type BookMedia = {
  id: string
  book_id: string
  media_id: string
  role: string
  sort_order: number
}

export type BookVideo = {
  id: string
  book_id: string
  kind: BookVideoKind
  label: string
  caption: string | null
  duration: string | null
  video_url: string | null
  media_id: string | null
  thumb_id: string | null
  sort_order: number
}

export type BookFeature = {
  id: string
  book_id: string
  icon: string
  title: string
  text: string | null
  sort_order: number
}

export type BookQuote = {
  id: string
  book_id: string | null
  text: string
  attribution: string | null
  sort_order: number
}

export type BookRetailer = {
  id: string
  book_id: string
  name: string
  mark: string | null
  tone: string | null
  url: string | null
  cta: string | null
  sort_order: number
}

export type BookSection = {
  id: string
  book_id: string
  kind: BookSectionKind
  heading: string | null
  body: string
  sort_order: number
}

export type BookLongPage = {
  book_id: string
  kind: BookSectionKind
  intro: string[]
  verdict: string | null
  quote: string | null
  bars: Json
  takeaways: Json
  updated_at: string
}

export type BookReviewPoint = {
  id: string
  book_id: string
  kind: ReviewPointKind
  text: string
  sort_order: number
}

export type BookRelated = {
  book_id: string
  related_book_id: string
  sort_order: number
}

export type Review = Stamps & {
  id: string
  book_id: string | null
  source: ReviewSource
  status: ReviewStatus
  author_name: string
  author_email: string | null
  avatar_id: string | null
  rating: number | null
  title: string | null
  body: string
  featured: boolean
  sort_order: number
  approved_by: string | null
  approved_at: string | null
}

export type Interview = Stamps & {
  id: string
  slug: string
  title: string
  book_id: string | null
  author_id: string | null
  image_id: string | null
  intro: string | null
  minutes: string | null
  published_label: string | null
  published_on: string | null
  status: ContentStatus
  featured: boolean
  sort_order: number
  created_by: string | null
}

export type InterviewQA = {
  id: string
  interview_id: string
  question: string
  answer: string
  sort_order: number
}

export type Week = Stamps & {
  id: string
  key: string
  label: string
  range_label: string | null
  starts_on: string | null
  ends_on: string | null
  status: ContentStatus
  sort_order: number
}

export type WeekBook = {
  id: string
  week_id: string
  book_id: string | null
  title: string
  author: string | null
  genre: string | null
  pages: number | null
  published_label: string | null
  cover_id: string | null
  sort_order: number
}

export type VideoRow = Stamps & {
  id: string
  key: string
  icon: string
  screen_label: string | null
  title: string
  description: string | null
  cta_label: string | null
  cta_href: string | null
  thumb_id: string | null
  video_url: string | null
  media_id: string | null
  status: ContentStatus
  sort_order: number
}

export type Service = Stamps & {
  id: string
  key: string
  glyph: string
  title_lines: string[]
  description: string | null
  sort_order: number
  visible: boolean
}

export type Page = Stamps & {
  id: string
  slug: string
  title: string
  status: ContentStatus
  is_system: boolean
}

export type PageSection = Stamps & {
  id: string
  page_id: string
  type: SectionType
  name: string | null
  content: Json
  visible: boolean
  sort_order: number
}

export type Menu = Stamps & {
  id: string
  key: string
  name: string
}

export type MenuItem = Stamps & {
  id: string
  menu_id: string
  parent_id: string | null
  label: string
  href: string
  target: LinkTarget
  visible: boolean
  sort_order: number
}

export type SocialLink = Stamps & {
  id: string
  platform: string
  label: string | null
  url: string
  icon: string | null
  visible: boolean
  sort_order: number
}

export type SeoMeta = Stamps & {
  id: string
  entity_type: SeoEntity
  entity_id: string | null
  title: string | null
  description: string | null
  canonical_url: string | null
  robots_noindex: boolean
  robots_nofollow: boolean
  og_title: string | null
  og_description: string | null
  og_type: string | null
  og_image_id: string | null
  twitter_card: string | null
  twitter_site: string | null
  twitter_creator: string | null
  structured_data: Json | null
  keywords: string[] | null
}

export type Setting = {
  key: string
  group_name: string
  label: string | null
  value: Json
  updated_by: string | null
  updated_at: string
}

export type Subscriber = {
  id: string
  email: string
  status: string
  source: string | null
  created_at: string
  unsubscribed_at: string | null
}

export type AuditLog = {
  id: number
  actor_id: string | null
  actor_email: string | null
  action: string
  entity: string
  entity_id: string | null
  summary: string | null
  diff: Json | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<Profile, 'id' | 'email'>
      media_folders: Table<MediaFolder, 'name' | 'slug'>
      media: Table<MediaRow, 'path' | 'filename'>
      categories: Table<Category, 'name' | 'slug'>
      authors: Table<Author, 'slug' | 'name'>
      books: Table<Book, 'slug' | 'title'>
      book_categories: Table<BookCategory, 'book_id' | 'category_id'>
      book_media: Table<BookMedia, 'book_id' | 'media_id'>
      book_videos: Table<BookVideo, 'book_id' | 'label'>
      book_features: Table<BookFeature, 'book_id' | 'title'>
      book_quotes: Table<BookQuote, 'text'>
      book_retailers: Table<BookRetailer, 'book_id' | 'name'>
      book_sections: Table<BookSection, 'book_id' | 'kind' | 'body'>
      book_long_pages: Table<BookLongPage, 'book_id' | 'kind'>
      book_review_points: Table<BookReviewPoint, 'book_id' | 'kind' | 'text'>
      book_related: Table<BookRelated, 'book_id' | 'related_book_id'>
      reviews: Table<Review, 'author_name' | 'body'>
      interviews: Table<Interview, 'slug' | 'title'>
      interview_qa: Table<InterviewQA, 'interview_id' | 'question' | 'answer'>
      weeks: Table<Week, 'key' | 'label'>
      week_books: Table<WeekBook, 'week_id' | 'title'>
      videos: Table<VideoRow, 'key' | 'title'>
      services: Table<Service, 'key'>
      pages: Table<Page, 'slug' | 'title'>
      page_sections: Table<PageSection, 'page_id' | 'type'>
      menus: Table<Menu, 'key' | 'name'>
      menu_items: Table<MenuItem, 'menu_id' | 'label' | 'href'>
      social_links: Table<SocialLink, 'platform' | 'url'>
      seo_meta: Table<SeoMeta, 'entity_type'>
      settings: Table<Setting, 'key'>
      subscribers: Table<Subscriber, 'email'>
      audit_log: Table<AuditLog, 'action' | 'entity'>
    }
    Views: Record<never, never>
    Functions: {
      cms_role: { Args: Record<string, never>; Returns: UserRole }
      is_editor: { Args: Record<string, never>; Returns: boolean }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_owner: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      content_status: ContentStatus
      media_kind: MediaKind
      review_status: ReviewStatus
      review_source: ReviewSource
      taxonomy_type: TaxonomyType
      book_video_kind: BookVideoKind
      book_section_kind: BookSectionKind
      review_point_kind: ReviewPointKind
      seo_entity: SeoEntity
      link_target: LinkTarget
      section_type: SectionType
    }
    CompositeTypes: Record<never, never>
  }
}
