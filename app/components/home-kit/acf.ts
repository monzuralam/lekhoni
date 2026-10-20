import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { PRODUCT_CARD_FRAGMENT, type ProductCardData } from '@/lib/products'
import { contentLink, type AcfImage, type AcfLink } from '../home/content-data'

// Shared by the "Home – E-commerce" and "Home – Cosmetics" templates
// (home-ecommerce/, home-cosmetics/): ACF value helpers and the automatic
// product lists their sections fall back to.

export type { AcfImage, AcfLink }

export type HomeImage = { src: string; alt: string; width: number; height: number }

export type HomeLink = { href: string; label: string; external: boolean }

export const IMAGE_FIELDS = 'node { sourceUrl altText mediaDetails { width height } }'

// Switches that were never saved come back null: treat them as on
export const isOn = (value: boolean | null | undefined) => value !== false

// ACF select fields come back from GraphQL as a list (["truck"])
export const first = (value: string[] | string | null | undefined) =>
  (Array.isArray(value) ? value[0] : value) || null

export const text = (value: string | null | undefined, fallback = '') => value?.trim() || fallback

export function toImage (media: AcfImage | undefined, fallbackAlt = ''): HomeImage | null {
  const node = media?.node
  if (!node?.sourceUrl) return null
  return {
    src: node.sourceUrl,
    alt: node.altText || fallbackAlt,
    width: node.mediaDetails?.width || 800,
    height: node.mediaDetails?.height || 800
  }
}

// ACF link field -> storefront link; null without a URL
export function toLink (link: AcfLink | undefined, fallbackLabel: string): HomeLink | null {
  const parsed = contentLink(link ?? null)
  if (!parsed) return null
  return { href: parsed.href, label: parsed.label || fallbackLabel, external: parsed.external }
}

// Plain URL field -> storefront link
export function urlLink (url: string | null | undefined, label: string): HomeLink | null {
  return toLink(url ? { url, title: label, target: null } : null, label)
}

export type IdNodes = { nodes: { databaseId: number }[] } | null

export const ids = (connection: IdNodes | undefined) =>
  (connection?.nodes ?? []).map(node => node.databaseId)

// Background tints (ACF "tone"); full class names so Tailwind finds them
export const TONES = {
  accent: { bg: 'bg-accent/10', text: 'text-link' },
  sale: { bg: 'bg-sale/10', text: 'text-sale' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  star: { bg: 'bg-star/15', text: 'text-ink' }
} as const

export type Tone = keyof typeof TONES

export const tone = (value: string[] | string | null | undefined, fallback: Tone = 'accent'): Tone => {
  const picked = first(value)
  return picked && picked in TONES ? (picked as Tone) : fallback
}

// Automatic product lists. Kept in their own requests: a products(orderby)
// list in the same request as an ACF relationship reorders the picks.
export const PRODUCT_LISTS = {
  newest: '{ orderby: [{ field: DATE, order: DESC }] }',
  popular: '{ orderby: [{ field: POPULARITY, order: DESC }] }',
  rating: '{ orderby: [{ field: RATING, order: DESC }] }',
  sale: '{ onSale: true, orderby: [{ field: POPULARITY, order: DESC }] }'
} as const

export type ProductList = keyof typeof PRODUCT_LISTS

export async function getProductList (list: ProductList, count = 8): Promise<ProductCardData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  try {
    const data = await wpQuery(`
      ${PRODUCT_CARD_FRAGMENT}
      query HomeList($first: Int) {
        products(first: $first, where: ${PRODUCT_LISTS[list]}) { nodes { ...ProductCardFields } }
      }
    `, { first: count })
    return data?.products?.nodes ?? []
  } catch {
    return []
  }
}

// Best sellers of one category (and its subcategories)
export async function getCategoryProducts (categoryId: number, count = 8): Promise<ProductCardData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  try {
    const data = await wpQuery(`
      ${PRODUCT_CARD_FRAGMENT}
      query CategoryList($id: Int, $first: Int) {
        products(first: $first, where: { categoryId: $id, orderby: [{ field: POPULARITY, order: DESC }] }) {
          nodes { ...ProductCardFields }
        }
      }
    `, { id: categoryId, first: count })
    return data?.products?.nodes ?? []
  } catch {
    return []
  }
}

export type HomeCategory = {
  id: number
  name: string
  href: string
  count: number
  icon: string | null
  image: HomeImage | null
}

export const CATEGORY_FIELDS = `
  databaseId
  name
  uri
  slug
  ... on ProductCategory {
    count
    icon
    image { sourceUrl altText mediaDetails { width height } }
  }
`

type RawCategory = {
  databaseId: number
  name: string
  uri: string | null
  slug: string
  count?: number | null
  icon?: string | null
  image?: { sourceUrl: string; altText: string | null; mediaDetails: { width: number | null; height: number | null } | null } | null
}

export function toCategory (raw: RawCategory): HomeCategory {
  return {
    id: raw.databaseId,
    name: raw.name,
    href: (raw.uri ?? `/product-category/${raw.slug}`).replace(/\/+$/, ''),
    count: raw.count ?? 0,
    icon: raw.icon ?? null,
    image: raw.image ? toImage({ node: raw.image }, raw.name) : null
  }
}

// Top-level product categories (not "Uncategorized"), in their admin order
export async function getTopCategories (): Promise<HomeCategory[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  try {
    const data = await wpQuery(`{
      productCategories(first: 12, where: { hideEmpty: true, parent: 0, orderby: TERM_ORDER }) {
        nodes { ${CATEGORY_FIELDS} }
      }
    }`)
    return ((data?.productCategories?.nodes ?? []) as RawCategory[])
      .filter(category => category.slug !== 'uncategorized')
      .map(toCategory)
  } catch {
    return []
  }
}

// Picked categories (ACF taxonomy connection), else the top-level ones
export function pickedCategories (connection: { nodes: RawCategory[] } | null | undefined) {
  const picked = (connection?.nodes ?? []).map(toCategory)
  return picked.length ? Promise.resolve(picked) : getTopCategories()
}

export type { RawCategory }

// "৩০ নভেম্বর, ২০২৬ রাত ১১:৫৯" for a countdown's screen reader label
export function spokenDate (iso: string, timezone: string) {
  const options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' }
  try {
    return new Intl.DateTimeFormat('bn-BD', { ...options, timeZone: timezone }).format(new Date(iso))
  } catch {
    return new Intl.DateTimeFormat('bn-BD', options).format(new Date(iso))
  }
}
