import PageHead from '@/components/admin/PageHead'
import SectionBuilder from '@/components/admin/SectionBuilder'
import { requireRole } from '@/lib/auth'
import { adminDb } from '@/lib/admin/actions'
import { sectionContent, SECTION_LABELS } from '@/lib/cms/sections'
import type { SectionType } from '@/lib/supabase/database.types'

export const metadata = { title: 'Homepage' }

export default async function HomepagePage() {
  await requireRole('editor')
  const db = await adminDb()

  const { data: page } = await db.from('pages').select('id').eq('slug', 'home').maybeSingle()
  const { data: sections } = await db
    .from('page_sections')
    .select('id, type, name, content, visible, sort_order')
    .eq('page_id', page?.id ?? '')
    .order('sort_order')

  const rows = (sections ?? []).map((s) => ({
    id: s.id,
    type: s.type as SectionType,
    name: s.name ?? SECTION_LABELS[s.type as SectionType],
    visible: s.visible,
    content: sectionContent(s.type as SectionType, s.content) as unknown as Record<string, unknown>,
  }))

  return (
    <>
      <PageHead
        title="Homepage"
        sub="Drag to reorder, toggle to hide, click to edit. The site updates the moment you save."
      />
      <SectionBuilder sections={rows} />
    </>
  )
}
