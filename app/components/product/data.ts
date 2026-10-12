import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { PRODUCT_CARD_FRAGMENT, type ProductCardData } from '@/lib/products'

// Single product page data. Everything here runs on the server and is cached
// with `use cache`, so the page can be prerendered under cacheComponents.

const PRODUCT_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query ProductSingle($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      __typename
      databaseId
      name
      slug
      uri
      sku
      description
      shortDescription
      onSale
      averageRating
      reviewCount
      reviewsAllowed
      image {
        sourceUrl
        altText
      }
      galleryImages(first: 12) {
        nodes {
          sourceUrl
          altText
        }
      }
      productCategories(first: 1) {
        nodes {
          name
          slug
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
      ... on ProductWithDimensions {
        weight
        length
        width
        height
      }
      ... on ProductWithAttributes {
        attributes {
          nodes {
            name
            label
            options
            variation
            visible
            ... on GlobalProductAttribute {
              terms(first: 100) {
                nodes {
                  name
                  slug
                }
              }
            }
          }
        }
        defaultAttributes {
          nodes {
            name
            value
          }
        }
      }
      ... on VariableProduct {
        variations(first: 100) {
          nodes {
            databaseId
            price
            regularPrice
            rawPrice: price(format: RAW)
            rawRegularPrice: regularPrice(format: RAW)
            onSale
            stockStatus
            stockQuantity
            manageStock
            sku
            image {
              sourceUrl
              altText
            }
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
      ... on ExternalProduct {
        externalUrl
        buttonText
      }
      ... on GroupProduct {
        products(first: 20) {
          nodes {
            ... on Product {
              databaseId
              name
              uri
              image {
                sourceUrl
                altText
              }
            }
            ... on ProductWithPricing {
              price
            }
            ... on InventoriedProduct {
              stockStatus
            }
          }
        }
      }
      reviews(first: 20) {
        edges {
          rating
          node {
            id
            content
            date
            author {
              node {
                name
              }
            }
          }
        }
      }
      related(first: 8) {
        nodes {
          ...ProductCardFields
        }
      }
    }
  }
`

export type ImageData = { sourceUrl: string; altText: string | null }

export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER'

export type AttributeData = {
  name: string
  label: string | null
  options: string[] | null
  variation: boolean | null
  visible: boolean | null
  terms?: { nodes: { name: string; slug: string }[] } | null
}

export type VariationData = {
  databaseId: number
  price: string | null
  regularPrice: string | null
  rawPrice: string | null
  rawRegularPrice: string | null
  onSale: boolean | null
  stockStatus: StockStatus | null
  stockQuantity: number | null
  manageStock: boolean | null
  sku: string | null
  image: ImageData | null
  // value '' means the variation accepts any value for that attribute
  attributes: { nodes: { name: string; value: string }[] } | null
}

export type GroupedChild = {
  databaseId: number
  name: string
  uri: string
  image: ImageData | null
  price?: string | null
  stockStatus?: StockStatus | null
}

export type ReviewEdge = {
  rating: number | null
  node: {
    id: string
    content: string | null
    date: string | null
    author: { node: { name: string | null } | null } | null
  }
}

export type ProductData = {
  __typename: string
  databaseId: number
  name: string
  slug: string
  uri: string
  sku: string | null
  description: string | null
  shortDescription: string | null
  onSale: boolean
  averageRating: number | null
  reviewCount: number | null
  reviewsAllowed: boolean | null
  image: ImageData | null
  galleryImages: { nodes: ImageData[] } | null
  productCategories: { nodes: { name: string; slug: string; uri: string }[] } | null
  price?: string | null
  regularPrice?: string | null
  rawPrice?: string | null
  rawRegularPrice?: string | null
  stockStatus?: StockStatus | null
  stockQuantity?: number | null
  manageStock?: boolean | null
  weight?: string | null
  length?: string | null
  width?: string | null
  height?: string | null
  attributes?: { nodes: AttributeData[] } | null
  defaultAttributes?: { nodes: { name: string; value: string }[] } | null
  variations?: { nodes: VariationData[] } | null
  externalUrl?: string | null
  buttonText?: string | null
  products?: { nodes: GroupedChild[] } | null
  reviews: { edges: ReviewEdge[] } | null
  related: { nodes: ProductCardData[] } | null
}

export async function getProduct (slug: string): Promise<ProductData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `product:${slug}`)
  try {
    const data = await wpQuery(PRODUCT_QUERY, { slug })
    return data?.product ?? null
  } catch (error) {
    // WooGraphQL reports an unknown slug as an error instead of null
    if (error instanceof Error && /No product ID was found/i.test(error.message)) return null
    throw error
  }
}

export async function getProductSlugs (): Promise<string[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  const data = await wpQuery(`{ products(first: 100) { nodes { slug } } }`)
  return (data?.products?.nodes ?? []).map((node: { slug: string }) => node.slug)
}

// Fallback for products without a `related` list: same category, minus itself
export async function getCategoryProducts (
  category: string,
  excludeId: number
): Promise<ProductCardData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const data = await wpQuery(
    `${PRODUCT_CARD_FRAGMENT}
    query CategoryProducts($category: String!, $exclude: [Int]) {
      products(first: 8, where: { category: $category, exclude: $exclude }) {
        nodes {
          ...ProductCardFields
        }
      }
    }`,
    { category, exclude: [excludeId] }
  )
  return data?.products?.nodes ?? []
}

// Cards for the recently viewed list, returned in the order of `ids`
export async function getProductCards (ids: number[]): Promise<ProductCardData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  if (!ids.length) return []
  const data = await wpQuery(
    `${PRODUCT_CARD_FRAGMENT}
    query ProductCards($ids: [Int], $first: Int) {
      products(first: $first, where: { include: $ids }) {
        nodes {
          ...ProductCardFields
        }
      }
    }`,
    { ids, first: ids.length }
  )
  const nodes: ProductCardData[] = data?.products?.nodes ?? []
  const byId = new Map(nodes.map(node => [node.databaseId, node]))
  return ids.flatMap(id => byId.get(id) ?? [])
}
