import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from './wp'

// What "/" shows, from Settings > Reading > "Your homepage displays":
// - a static page with the Home Shop template -> 'shop' (design/home-shop.html)
// - a static page with any other template     -> 'page' (that page's content)
// - "Your latest posts", or no page chosen    -> 'posts' (design/index.html)

export type FrontPage = { kind: 'shop' } | { kind: 'page'; uri: string } | { kind: 'posts' }

export async function getFrontPage (): Promise<FrontPage> {
  'use cache'
  cacheLife('minutes')
  cacheTag('blog-settings', 'pages')
  try {
    const data = await wpQuery(`{
      nodeByUri(uri: "/") {
        __typename
        ... on Page { uri template { __typename } }
      }
    }`)
    const node = data?.nodeByUri
    if (node?.__typename !== 'Page') return { kind: 'posts' }
    return node.template?.__typename === 'Template_HomeShop' ? { kind: 'shop' } : { kind: 'page', uri: node.uri }
  } catch {
    // WordPress unreachable: keep the shop home, whose sections handle missing data
    return { kind: 'shop' }
  }
}
