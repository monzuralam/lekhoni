import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from './wp'
import { plainText } from './products'

// Site search for the header palette (/api/search) and the /search page:
// products, product categories, posts and pages, via WPGraphQL + WooGraphQL.

export type SearchType = 'product' | 'category' | 'post' | 'page'

export type SearchResult = {
  type: SearchType
  title: string
  url: string
  text: string // short plain-text summary (may be empty)
}

export const SEARCH_TYPE_LABEL: Record<SearchType, string> = {
  product: 'পণ্য',
  category: 'বিষয়',
  post: 'পোস্ট',
  page: 'পেজ'
}

// WordPress URIs end with "/"; storefront paths don't
const toPath = (uri: string | null | undefined) => (uri ? uri.replace(/\/+$/, '') || '/' : null)

const short = (html: string | null | undefined, max = 160) => {
  const text = plainText(html).replace(/\s*\[…\]$/, '…')
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

type RawResults = {
  products: { nodes: { name: string; uri: string; shortDescription: string | null }[] } | null
  productCategories: { nodes: { name: string; uri: string; count: number | null }[] } | null
  contentNodes: { nodes: { __typename: string; uri: string | null; title?: string; excerpt?: string | null }[] } | null
}

export async function searchSite (query: string, perType = 10): Promise<SearchResult[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('search', 'products', 'posts', 'pages')

  const q = query.trim().slice(0, 100)
  if (q.length < 2) return []

  const data: RawResults = await wpQuery(
    `query Search($q: String, $first: Int) {
      products(first: $first, where: { search: $q }) {
        nodes { name uri shortDescription }
      }
      productCategories(first: $first, where: { nameLike: $q, hideEmpty: true }) {
        nodes { name uri count }
      }
      contentNodes(first: $first, where: { search: $q, contentTypes: [POST, PAGE] }) {
        nodes {
          __typename
          uri
          ... on NodeWithTitle { title }
          ... on Post { excerpt }
        }
      }
    }`,
    { q, first: perType }
  )

  const results: SearchResult[] = []
  for (const product of data?.products?.nodes ?? []) {
    const url = toPath(product.uri)
    if (url) results.push({ type: 'product', title: product.name, url, text: short(product.shortDescription) })
  }
  for (const category of data?.productCategories?.nodes ?? []) {
    const url = toPath(category.uri)
    if (url) results.push({ type: 'category', title: category.name, url, text: '' })
  }
  for (const node of data?.contentNodes?.nodes ?? []) {
    const url = toPath(node.uri)
    // The "Posts page" has uri: null and is skipped
    if (!url || !node.title) continue
    results.push({
      type: node.__typename === 'Post' ? 'post' : 'page',
      title: node.title,
      url,
      text: node.__typename === 'Post' ? short(node.excerpt) : ''
    })
  }
  return results
}

// Shown before typing: top-level product categories that have products
export async function searchSuggestions (): Promise<SearchResult[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('search', 'products')
  const data = await wpQuery(`{
    productCategories(first: 8, where: { hideEmpty: true, parent: 0, orderby: COUNT, order: DESC }) {
      nodes { name uri slug }
    }
  }`)
  return (data?.productCategories?.nodes ?? [])
    .filter((category: { slug: string }) => category.slug !== 'uncategorized')
    .map((category: { name: string; uri: string }) => ({
      type: 'category' as const,
      title: category.name,
      url: toPath(category.uri) ?? '/shop',
      text: ''
    }))
}
