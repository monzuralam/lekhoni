import { bn } from './bn'

// Shared WooGraphQL product fields for <ProductCard />. Spread it inside a
// `products { nodes { ...ProductCardFields } }` selection and append
// PRODUCT_CARD_FRAGMENT to the query string.
export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCardFields on Product {
    __typename
    databaseId
    name
    slug
    uri
    onSale
    averageRating
    reviewCount
    shortDescription
    image {
      sourceUrl
      altText
    }
    galleryImages(first: 1) {
      nodes {
        sourceUrl
      }
    }
    productCategories(first: 1) {
      nodes {
        name
        uri
      }
    }
    ... on ProductWithPricing {
      price
      regularPrice
      rawPrice: price(format: RAW)
      rawRegularPrice: regularPrice(format: RAW)
    }
    ... on InventoriedProduct {
      stockStatus
      stockQuantity
      manageStock
    }
    ... on SimpleProduct {
      dateOnSaleTo
      totalSales
    }
    ... on VariableProduct {
      dateOnSaleTo
      totalSales
    }
  }
`

export type ProductCardData = {
  __typename: string
  databaseId: number
  name: string
  slug: string
  uri: string
  onSale: boolean
  averageRating: number | null
  reviewCount: number | null
  shortDescription?: string | null
  image: { sourceUrl: string; altText: string } | null
  galleryImages: { nodes: { sourceUrl: string }[] } | null
  productCategories: { nodes: { name: string; uri: string }[] } | null
  price?: string | null
  regularPrice?: string | null
  rawPrice?: string | null
  rawRegularPrice?: string | null
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER' | null
  stockQuantity?: number | null
  manageStock?: boolean | null
  dateOnSaleTo?: string | null
  totalSales?: number | null
}

// Whole-number discount, e.g. 22 for 350 vs 450. Null for price ranges
// (variable products return "10, 20") or when there is no saving.
export function discountPercent (product: ProductCardData) {
  const price = Number(product.rawPrice)
  const regular = Number(product.rawRegularPrice)
  if (!price || !regular || regular <= price) return null
  return Math.round((1 - price / regular) * 100)
}

// Sold vs remaining stock, only when WooCommerce tracks the quantity.
export function stockProgress (product: ProductCardData) {
  if (!product.manageStock || product.stockQuantity == null) return null
  const left = Math.max(0, product.stockQuantity)
  const sold = Math.max(0, product.totalSales ?? 0)
  const total = sold + left
  if (!total) return null
  return { sold, left, percent: Math.round((sold / total) * 100) }
}

// WooCommerce formats prices with the store currency symbol, which can come
// back as an HTML entity (৳ is &#2547;). Decode it and switch to Bangla digits.
export function formatPrice (value: string | null | undefined) {
  if (!value) return ''
  const decoded = value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
  return bn(decoded)
}

// WordPress HTML (e.g. shortDescription) -> plain text for compact UI
export function plainText (html: string | null | undefined) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
