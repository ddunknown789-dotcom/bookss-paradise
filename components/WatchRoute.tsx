import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import WatchPage from '@/components/WatchPage'
import { buildMetadata } from '@/lib/cms/metadata'
import { getVideoItems } from '@/lib/cms/queries'
import { WATCH_PAGES, youtubeThumb, type WatchCategory } from '@/lib/video'
import type { VideoItemView } from '@/lib/cms/types'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/schema'
import { absoluteUrl } from '@/lib/site'

/**
 * What the three /watch routes have in common.
 *
 * They are three separate pages with three separate addresses — this is only
 * the part that would otherwise be copied verbatim into each of them: fetch
 * the category's videos, describe the page to search engines, render it.
 */

/**
 * The gallery as a list of videos, for the search engines.
 *
 * A VideoObject is what makes a video eligible for a rich result, and Google
 * will not grant one without `uploadDate` — so a row that has no date is left
 * out of the list rather than handed a date nobody entered. Everything
 * asserted here is also on the page for a human to read, which is the rule the
 * rest of the site's structured data follows.
 */
function videoList(path: string, name: string, items: VideoItemView[]) {
  const dated = items.filter((item) => item.published)
  if (!dated.length) return null

  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl(path)}#videos`,
    name,
    numberOfItems: dated.length,
    itemListElement: dated.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: item.title,
        uploadDate: item.published,
        ...(item.description ? { description: item.description } : {}),
        ...(thumbnailFor(item) ? { thumbnailUrl: thumbnailFor(item) } : {}),
        // embedUrl is the player; contentUrl is the file itself. Google wants
        // whichever one actually exists, never a guess at the other.
        ...(item.youtubeId
          ? { embedUrl: `https://www.youtube.com/embed/${item.youtubeId}` }
          : { contentUrl: absoluteUrl(item.src) }),
      },
    })),
  }
}

const thumbnailFor = (item: VideoItemView): string =>
  item.poster
    ? absoluteUrl(item.poster)
    : item.youtubeId
      ? youtubeThumb(item.youtubeId, 'hq')
      : ''

export async function watchMetadata(category: WatchCategory): Promise<Metadata> {
  const page = WATCH_PAGES[category]
  return buildMetadata({
    entityType: 'collection',
    fallback: { title: page.metaTitle, description: page.metaDescription },
    path: page.path,
  })
}

export default async function WatchRoute({ category }: { category: WatchCategory }) {
  const page = WATCH_PAGES[category]
  const items = await getVideoItems(category)

  const pageGraph = graph(
    webPageSchema({
      path: page.path,
      name: page.metaTitle,
      description: page.metaDescription,
      type: 'CollectionPage',
      breadcrumbPath: page.path,
    }),
    breadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: page.crumb, path: page.path },
      ],
      page.path,
    ),
    videoList(page.path, page.metaTitle, items),
  )

  return (
    <>
      <JsonLd id={`watch-${category}-graph`} json={pageGraph} />
      <WatchPage page={page} items={items} />
    </>
  )
}
