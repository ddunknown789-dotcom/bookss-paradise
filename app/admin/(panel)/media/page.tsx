import { revalidatePath } from 'next/cache'

import PageHead from '@/components/admin/PageHead'
import MediaBrowser from '@/components/admin/MediaBrowser'
import { requireRole } from '@/lib/auth'
import { loadMediaLibrary } from '@/lib/admin/media'

export const metadata = { title: 'Media Library' }

export default async function MediaPage() {
  await requireRole('editor')
  const { items, folders, supabaseUrl } = await loadMediaLibrary()

  async function refresh() {
    'use server'
    revalidatePath('/admin/media')
  }

  const images = items.filter((m) => m.kind === 'image').length
  const videos = items.filter((m) => m.kind === 'video').length
  const pdfs = items.filter((m) => m.kind === 'pdf').length

  return (
    <>
      <PageHead
        title="Media Library"
        sub={
          items.length
            ? `${items.length} files · ${images} images, ${videos} videos, ${pdfs} PDFs`
            : 'Upload the images, videos and PDFs used across the site.'
        }
      />

      <section className="ad-panel">
        <div className="ad-panel-body">
          <MediaBrowser items={items} folders={folders} supabaseUrl={supabaseUrl} onRefresh={refresh} />
        </div>
      </section>
    </>
  )
}
