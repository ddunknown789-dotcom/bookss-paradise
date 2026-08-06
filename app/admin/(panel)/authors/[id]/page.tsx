import { notFound } from 'next/navigation'

import PageHead from '@/components/admin/PageHead'
import EntityForm from '@/components/admin/EntityForm'
import MediaPicker from '@/components/admin/MediaPicker'
import { Area, Select, SlugPair, Text } from '@/components/admin/ui'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { loadMediaLibrary, findMedia } from '@/lib/admin/media'
import { saveAuthor } from '../actions'

export const metadata = { title: 'Edit author' }

export default async function AuthorEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('editor')
  const { id } = await params
  const isNew = id === 'new'

  const { items: media, folders, supabaseUrl } = await loadMediaLibrary()
  const db = await adminDb()

  let a: Record<string, any> = { name: '', slug: '', bio: '', website: '', socials: {}, status: 'published', sort_order: 0 }
  if (!isNew) {
    const { data } = await db.from('authors').select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    a = data
  }

  const socials = (a.socials ?? {}) as Record<string, string | null>

  async function save(fd: FormData) {
    'use server'
    return saveAuthor(isNew ? null : id, fd)
  }

  return (
    <>
      <PageHead title={isNew ? 'New author' : a.name} back={{ href: '/admin/authors', label: 'Authors' }} />

      <EntityForm onSave={save} saveLabel="Save author">
        <div className="ad-split">
          <section className="ad-panel">
            <div className="ad-panel-body">
              <SlugPair titleName="name" titleLabel="Name" defaultTitle={a.name} defaultSlug={a.slug} />
              <Area label="Biography" name="bio" defaultValue={a.bio ?? ''} big optional />
              <Text label="Website" name="website" defaultValue={a.website ?? ''} optional placeholder="https://…" />
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section className="ad-panel">
              <div className="ad-panel-body">
                <MediaPicker
                  name="photo_id"
                  label="Photo"
                  value={findMedia(media, a.photo_id)}
                  items={media}
                  folders={folders}
                  supabaseUrl={supabaseUrl}
                  optional
                />
                <Select
                  label="Status"
                  name="status"
                  defaultValue={a.status}
                  options={[
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft — hidden' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
                <Text label="Sort order" name="sort_order" type="number" defaultValue={String(a.sort_order ?? 0)} />
              </div>
            </section>

            <section className="ad-panel">
              <div className="ad-panel-head"><h2>Social links</h2></div>
              <div className="ad-panel-body">
                <Text label="Instagram" name="instagram" defaultValue={socials.instagram ?? ''} optional />
                <Text label="X / Twitter" name="twitter" defaultValue={socials.twitter ?? ''} optional />
                <Text label="Facebook" name="facebook" defaultValue={socials.facebook ?? ''} optional />
                <Text label="Goodreads" name="goodreads" defaultValue={socials.goodreads ?? ''} optional />
              </div>
            </section>
          </aside>
        </div>
      </EntityForm>
    </>
  )
}
