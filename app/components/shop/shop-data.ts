import { cacheLife } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { PRODUCT_CARD_FRAGMENT, formatPrice, type ProductCardData } from '@/lib/products'

// Data layer for design/shop.html: ShopFilters, ShopToolbar, ProductGrid and
// Pagination all read from the URL search params parsed here.

export const PAGE_SIZE = 12

// design/shop.html <select data-shop-sort>, plus newest/popularity
export const SORT_OPTIONS = [
  { value: 'default', label: 'ডিফল্ট ক্রম', orderby: [{ field: 'MENU_ORDER', order: 'ASC' }, { field: 'NAME', order: 'ASC' }] },
  { value: 'newest', label: 'নতুন আগে', orderby: [{ field: 'DATE', order: 'DESC' }] },
  { value: 'popularity', label: 'জনপ্রিয়তা অনুযায়ী', orderby: [{ field: 'POPULARITY', order: 'DESC' }] },
  { value: 'price-asc', label: 'দাম: কম থেকে বেশি', orderby: [{ field: 'PRICE', order: 'ASC' }] },
  { value: 'price-desc', label: 'দাম: বেশি থেকে কম', orderby: [{ field: 'PRICE', order: 'DESC' }] },
  { value: 'rating', label: 'রেটিং অনুযায়ী', orderby: [{ field: 'RATING', order: 'DESC' }] },
  { value: 'name', label: 'নাম অনুযায়ী', orderby: [{ field: 'NAME', order: 'ASC' }] }
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

export type ShopCategory = {
  databaseId: number
  name: string
  slug: string
  uri: string
  description: string | null
  parentDatabaseId: number | null
  count: number // products in this category or any of its children
  depth: number
}

export type ShopCatalog = {
  categories: ShopCategory[] // parents first, each followed by its children
  priceMax: number // slider upper bound
  priceStep: number
  currency: string // e.g. "£", taken from a formatted WooCommerce price
}

export type ShopFilters = {
  categories: string[] // slugs from ?category=, plus the category page's own slug
  minPrice: number | null
  maxPrice: number | null
  inStock: boolean
  sort: SortValue
  page: number
}

type RawSearchParams = Record<string, string | string[] | undefined>

const list = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value : value ? [value] : []).flatMap(v => v.split(',')).map(v => v.trim()).filter(Boolean)

const positive = (value: string | string[] | undefined) => {
  const number = Number(Array.isArray(value) ? value[0] : value)
  return Number.isFinite(number) && number >= 0 && value !== undefined && value !== '' ? number : null
}

// ?category=hoodies&category=music&minPrice=10&maxPrice=40&inStock=1&sort=price-asc&page=2
export function parseShopParams (params: RawSearchParams, baseCategory?: string): ShopFilters {
  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort
  const sort = SORT_OPTIONS.find(option => option.value === sortParam)?.value ?? 'default'
  const page = Math.max(1, Math.floor(positive(params.page) ?? 1))
  const categories = list(params.category).filter(slug => slug !== baseCategory)
  return {
    categories: baseCategory ? [baseCategory, ...categories] : categories,
    minPrice: positive(params.minPrice),
    maxPrice: positive(params.maxPrice),
    inStock: ['1', 'true', 'on'].includes(String(params.inStock)),
    sort,
    page
  }
}

// Builds a shop URL that keeps the current filters, e.g. for pagination links.
// The category page's own slug lives in the path, not in ?category=.
export function shopHref (
  basePath: string,
  filters: ShopFilters,
  baseCategory: string | undefined,
  overrides: Partial<ShopFilters> = {}
) {
  const next = { ...filters, ...overrides }
  const params = new URLSearchParams()
  next.categories.filter(slug => slug !== baseCategory).forEach(slug => params.append('category', slug))
  if (next.minPrice != null) params.set('minPrice', String(next.minPrice))
  if (next.maxPrice != null) params.set('maxPrice', String(next.maxPrice))
  if (next.inStock) params.set('inStock', '1')
  if (next.sort !== 'default') params.set('sort', next.sort)
  if (next.page > 1) params.set('page', String(next.page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

// WooGraphQL connections cap `first` at 100, so walk the cursors for full lists
async function fetchAllNodes<T> (query: string, variables: Record<string, unknown>, pick: (data: any) => any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const nodes: T[] = []
  let after: string | null = null
  do {
    const connection = pick(await wpQuery(query, { ...variables, after }))
    nodes.push(...(connection?.nodes ?? []))
    after = connection?.pageInfo?.hasNextPage ? connection.pageInfo.endCursor : null
  } while (after)
  return nodes
}

const niceStep = (max: number) => (max <= 100 ? 5 : max <= 500 ? 10 : max <= 2000 ? 50 : 100)

// Categories with rolled-up counts and the price slider bounds. WooCommerce's
// term `count` only covers products assigned directly (Clothing = 1), so the
// sidebar counts are computed from the product list instead.
export async function getShopCatalog (): Promise<ShopCatalog> {
  'use cache'
  cacheLife('minutes')

  const [categoryData, products] = await Promise.all([
    wpQuery(`{
      productCategories(first: 100, where: { hideEmpty: false }) {
        nodes { databaseId name slug uri description parentDatabaseId }
      }
    }`),
    fetchAllNodes<{
      productCategories: { nodes: { databaseId: number }[] } | null
      price?: string | null
      rawPrice?: string | null
    }>(
      `query ShopCatalogProducts($after: String) {
        products(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            productCategories(first: 20) { nodes { databaseId } }
            ... on ProductWithPricing { price rawPrice: price(format: RAW) }
          }
        }
      }`,
      {},
      data => data?.products
    )
  ])

  const terms: Omit<ShopCategory, 'count' | 'depth'>[] = categoryData?.productCategories?.nodes ?? []
  const byId = new Map(terms.map(term => [term.databaseId, term]))

  const counts = new Map<number, number>()
  let highest = 0
  let currency = ''
  for (const product of products) {
    const ids = new Set<number>()
    for (const { databaseId } of product.productCategories?.nodes ?? []) {
      let id: number | null | undefined = databaseId
      while (id && !ids.has(id)) {
        ids.add(id)
        id = byId.get(id)?.parentDatabaseId
      }
    }
    ids.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1))

    // Variable products return "42.00, 45.00", grouped ones "£18.00 - £45.00"
    const prices = (product.rawPrice ?? '').match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []
    highest = Math.max(highest, ...prices)
    if (!currency && product.price) currency = formatPrice(product.price).replace(/[\d০-৯.,\s-].*$/, '').trim()
  }

  // Depth-first order: each parent followed by its children
  const categories: ShopCategory[] = []
  const walk = (parent: number | null, depth: number) => {
    terms
      .filter(term => (term.parentDatabaseId ?? null) === parent && (counts.get(term.databaseId) ?? 0) > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(term => {
        categories.push({ ...term, count: counts.get(term.databaseId) ?? 0, depth })
        walk(term.databaseId, depth + 1)
      })
  }
  walk(null, 0)

  const priceStep = niceStep(highest)
  return {
    categories,
    priceMax: Math.max(priceStep, Math.ceil(highest / priceStep) * priceStep),
    priceStep,
    currency
  }
}

// All categories (including empty ones) for resolving /product-category/... URIs
export async function getCategoryByPath (slugs: string[]) {
  'use cache'
  cacheLife('minutes')

  const data = await wpQuery(`{
    productCategories(first: 100, where: { hideEmpty: false }) {
      nodes { databaseId name slug uri description parentDatabaseId }
    }
  }`)
  const terms: Omit<ShopCategory, 'count' | 'depth'>[] = data?.productCategories?.nodes ?? []
  const path = `/product-category/${slugs.map(safeDecode).join('/')}/`
  const category = terms.find(term => safeDecode(term.uri) === path)
  if (!category) return null

  const ancestors: typeof terms = []
  let parent = terms.find(term => term.databaseId === category.parentDatabaseId)
  while (parent && !ancestors.includes(parent)) {
    ancestors.unshift(parent)
    const parentId: number | null = parent.parentDatabaseId
    parent = terms.find(term => term.databaseId === parentId)
  }
  return { category, ancestors }
}

export async function getAllCategoryPaths () {
  'use cache'
  cacheLife('minutes')
  const data = await wpQuery('{ productCategories(first: 100, where: { hideEmpty: false }) { nodes { uri } } }')
  return ((data?.productCategories?.nodes ?? []) as { uri: string }[]).map(({ uri }) =>
    uri.replace(/^\/product-category\//, '').replace(/\/$/, '').split('/')
  )
}

function safeDecode (value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// Category paths without the trailing slash WordPress adds
export const categoryPath = (uri: string) => uri.replace(/\/$/, '')

// Pagination: WooGraphQL has no offsetPagination or total count, so first
// fetch only the ordered ids of every matching product (cheap, cursor-walked
// in batches of 100), which gives the total and the numbered pages the design
// shows. Then load the full card fields for just the current page's ids.
export async function getShopPage (filters: ShopFilters, catalog: ShopCatalog) {
  const where: Record<string, unknown> = {
    orderby: SORT_OPTIONS.find(option => option.value === filters.sort)!.orderby
  }
  if (filters.categories.length) where.categoryIn = filters.categories
  if (filters.minPrice != null && filters.minPrice > 0) where.minPrice = filters.minPrice
  if (filters.maxPrice != null && filters.maxPrice < catalog.priceMax) where.maxPrice = filters.maxPrice
  if (filters.inStock) where.stockStatus = ['IN_STOCK', 'ON_BACKORDER']

  const ids = (
    await fetchAllNodes<{ databaseId: number }>(
      `query ShopProductIds($after: String, $where: RootQueryToProductConnectionWhereArgs) {
        products(first: 100, after: $after, where: $where) {
          pageInfo { hasNextPage endCursor }
          nodes { databaseId }
        }
      }`,
      { where },
      data => data?.products
    )
  ).map(node => node.databaseId)

  const total = ids.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (filters.page - 1) * PAGE_SIZE
  const pageIds = ids.slice(start, start + PAGE_SIZE)

  let products: ProductCardData[] = []
  if (pageIds.length) {
    const data = await wpQuery(
      `
      ${PRODUCT_CARD_FRAGMENT}
      query ShopProducts($ids: [Int], $first: Int) {
        products(first: $first, where: { include: $ids }) {
          nodes { ...ProductCardFields }
        }
      }
    `,
      { ids: pageIds, first: pageIds.length }
    )
    products = ((data?.products?.nodes ?? []) as ProductCardData[]).sort(
      (a, b) => pageIds.indexOf(a.databaseId) - pageIds.indexOf(b.databaseId)
    )
  }

  return { products, total, totalPages, start }
}
