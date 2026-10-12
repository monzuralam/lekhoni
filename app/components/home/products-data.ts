import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { PRODUCT_CARD_FRAGMENT, plainText, type ProductCardData } from '@/lib/products'
import { getProduct, getProductCards, type ProductData } from '../product/data'

// Data for the home page product sections. Settings come from the ACF group
// "Home Shop" (inc/acf-home.php, GraphQL `page { homeShop }`);
// every section falls back to a WooCommerce query when its fields are empty.
// Cached with `use cache`; tags: 'products', 'home-products'.
//
// The ACF settings are fetched on their own: a sibling `products` query
// ordered by POPULARITY in the same GraphQL request reorders the ACF
// relationship results (WooGraphQL ordering leaks), losing the picked order.

type IdNodes = { nodes: { databaseId: number }[] } | null

type MediaNode = {
  node: {
    sourceUrl: string
    altText: string | null
    mediaDetails: { width: number | null; height: number | null } | null
  } | null
} | null

export type HomeImage = { sourceUrl: string; altText: string; width: number; height: number }

type Settings = {
  featuredSection: {
    title: string | null
    newLabel: string | null
    bestLabel: string | null
    saleLabel: string | null
    newProducts: IdNodes
    bestProducts: IdNodes
    saleProducts: IdNodes
  } | null
  spotlightSection: {
    eyebrow: string | null
    highlights: { text: string | null }[] | null
    product: { node: { databaseId: number; slug: string } | null } | null
  } | null
  bestSellersSection: {
    title: string | null
    products: IdNodes
  } | null
  reviewsSection: {
    title: string | null
    source: string[] | null
    testimonials: {
      name: string | null
      location: string | null
      rating: number | null
      verified: boolean | null
      text: string | null
      photo: MediaNode
    }[] | null
  } | null
  brandsSection: {
    title: string | null
    brands: { name: string | null; link: string | null; logo: MediaNode }[] | null
  } | null
}

const MEDIA_FIELDS = 'node { sourceUrl altText mediaDetails { width height } }'

async function getSettings (): Promise<Settings | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', 'home-products')
  const data = await wpQuery(`
    {
      page(id: "/", idType: URI) {
        homeShop {
          featuredSection {
            title
            newLabel
            bestLabel
            saleLabel
            newProducts(first: 8) { nodes { databaseId } }
            bestProducts(first: 8) { nodes { databaseId } }
            saleProducts(first: 8) { nodes { databaseId } }
          }
          spotlightSection {
            eyebrow
            highlights { text }
            product { node { databaseId slug } }
          }
          bestSellersSection {
            title
            products(first: 8) { nodes { databaseId } }
          }
          reviewsSection {
            title
            source
            testimonials {
              name
              location
              rating
              verified
              text
              photo { ${MEDIA_FIELDS} }
            }
          }
          brandsSection {
            title
            brands {
              name
              link
              logo { ${MEDIA_FIELDS} }
            }
          }
        }
      }
    }
  `)
  return data?.page?.homeShop ?? null
}

function ids (connection: IdNodes | undefined) {
  return (connection?.nodes ?? []).map(node => node.databaseId)
}

function image (media: MediaNode, fallbackAlt = ''): HomeImage | null {
  const node = media?.node
  if (!node?.sourceUrl) return null
  return {
    sourceUrl: node.sourceUrl,
    altText: node.altText || fallbackAlt,
    width: node.mediaDetails?.width || 400,
    height: node.mediaDetails?.height || 400
  }
}

type ProductListWhere = 'newest' | 'popular' | 'sale'

const WHERE: Record<ProductListWhere, string> = {
  newest: '{ orderby: [{ field: DATE, order: DESC }] }',
  popular: '{ orderby: [{ field: POPULARITY, order: DESC }] }',
  sale: '{ onSale: true, orderby: [{ field: POPULARITY, order: DESC }] }'
}

async function getProductList (kind: ProductListWhere): Promise<ProductCardData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const data = await wpQuery(`
    ${PRODUCT_CARD_FRAGMENT}
    {
      products(first: 8, where: ${WHERE[kind]}) {
        nodes { ...ProductCardFields }
      }
    }
  `)
  return data?.products?.nodes ?? []
}

// Picked products in their picked order, else the fallback list
function pickedOr (picked: number[], fallback: ProductListWhere) {
  return picked.length ? getProductCards(picked) : getProductList(fallback)
}

/* Featured products tabs */

export type ProductTabData = { key: string; label: string; products: ProductCardData[] }

export async function getFeaturedTabs () {
  const section = (await getSettings())?.featuredSection
  const [newest, best, sale] = await Promise.all([
    pickedOr(ids(section?.newProducts), 'newest'),
    pickedOr(ids(section?.bestProducts), 'popular'),
    pickedOr(ids(section?.saleProducts), 'sale')
  ])
  const tabs: ProductTabData[] = [
    { key: 'new', label: section?.newLabel || 'নতুন এসেছে', products: newest },
    { key: 'best', label: section?.bestLabel || 'বেস্টসেলার', products: best },
    { key: 'sale', label: section?.saleLabel || 'অফারে', products: sale }
  ]
  return {
    title: section?.title || 'নির্বাচিত পণ্য',
    tabs: tabs.filter(tab => tab.products.length)
  }
}

/* Product spotlight */

// Best-selling in-stock variable product, else any in-stock simple/variable one
async function getDefaultSpotlightSlug (): Promise<string | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const data = await wpQuery(`
    {
      variable: products(first: 1, where: { typeIn: [VARIABLE], stockStatus: [IN_STOCK], orderby: [{ field: POPULARITY, order: DESC }] }) {
        nodes { slug }
      }
      any: products(first: 1, where: { typeIn: [SIMPLE, VARIABLE], stockStatus: [IN_STOCK], orderby: [{ field: POPULARITY, order: DESC }] }) {
        nodes { slug }
      }
    }
  `)
  return data?.variable?.nodes?.[0]?.slug || data?.any?.nodes?.[0]?.slug || null
}

export async function getSpotlight (): Promise<{
  eyebrow: string
  highlights: string[]
  product: ProductData
} | null> {
  const section = (await getSettings())?.spotlightSection
  const slug = section?.product?.node?.slug || await getDefaultSpotlightSlug()
  const product = slug ? await getProduct(slug) : null
  if (!product) return null
  return {
    eyebrow: section?.eyebrow || 'এই সপ্তাহের সেরা',
    highlights: (section?.highlights ?? []).flatMap(row => (row?.text ? [row.text] : [])),
    product
  }
}

/* Best sellers carousel */

export async function getBestSellers () {
  const section = (await getSettings())?.bestSellersSection
  return {
    title: section?.title || 'সবচেয়ে বেশি বিক্রীত',
    products: await pickedOr(ids(section?.products), 'popular')
  }
}

/* Customer reviews */

export type ReviewItem = {
  id: string
  name: string
  // Location or role for testimonials
  meta: string | null
  // Reviewed product for real reviews
  product: { name: string; uri: string } | null
  rating: number
  text: string
  verified: boolean
  photo: HomeImage | null
}

type ReviewSource = 'auto' | 'reviews' | 'testimonials' | 'both'

type ReviewProduct = {
  name: string
  uri: string
  reviews: {
    edges: {
      rating: number | null
      node: {
        databaseId: number
        content: string | null
        date: string | null
        author: { node: { name: string | null } | null } | null
      }
    }[]
  } | null
}

const MAX_REVIEWS = 8

// Approved product reviews rated 4 or 5 (newest first) and the store rating
async function getProductReviews () {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const data = await wpQuery(`
    {
      reviewed: products(first: 10, where: { orderby: [{ field: REVIEW_COUNT, order: DESC }] }) {
        nodes {
          name
          uri
          reviews(first: 5) {
            edges {
              rating
              node {
                databaseId
                content
                date
                author { node { name } }
              }
            }
          }
        }
      }
      ratings: products(first: 100) {
        nodes {
          averageRating
          reviewCount
        }
      }
    }
  `)

  const reviews: ReviewItem[] = ((data?.reviewed?.nodes ?? []) as ReviewProduct[])
    .flatMap(product => (product.reviews?.edges ?? []).map(edge => ({ edge, product })))
    .filter(({ edge }) => (edge.rating ?? 0) >= 4 && plainText(edge.node.content))
    .sort((a, b) => Date.parse(b.edge.node.date ?? '') - Date.parse(a.edge.node.date ?? ''))
    .slice(0, MAX_REVIEWS)
    .map(({ edge, product }) => ({
      id: `review-${edge.node.databaseId}`,
      name: edge.node.author?.node?.name || 'ক্রেতা',
      meta: null,
      product: { name: product.name, uri: product.uri },
      rating: edge.rating ?? 5,
      text: plainText(edge.node.content),
      verified: false,
      photo: null
    }))

  const rated: { averageRating: number | null; reviewCount: number | null }[] =
    data?.ratings?.nodes ?? []
  const count = rated.reduce((sum, node) => sum + (node.reviewCount ?? 0), 0)
  const total = rated.reduce(
    (sum, node) => sum + (node.averageRating ?? 0) * (node.reviewCount ?? 0),
    0
  )

  return { reviews, summary: count ? { average: total / count, count } : null }
}

export async function getCustomerReviews () {
  const section = (await getSettings())?.reviewsSection
  const source = (section?.source?.[0] || 'auto') as ReviewSource

  const testimonials: ReviewItem[] = (section?.testimonials ?? []).flatMap((row, index) =>
    row?.name && row?.text
      ? [{
          id: `testimonial-${index}`,
          name: row.name,
          meta: row.location || null,
          product: null,
          rating: Math.min(5, Math.max(1, Math.round(row.rating ?? 5))),
          text: row.text,
          verified: Boolean(row.verified),
          photo: image(row.photo, row.name)
        }]
      : []
  )

  const { reviews, summary } = source === 'testimonials'
    ? { reviews: [], summary: null }
    : await getProductReviews()

  const items =
    source === 'reviews' ? reviews
      : source === 'testimonials' ? testimonials
        : source === 'both' ? [...testimonials, ...reviews]
          : reviews.length ? reviews : testimonials

  return {
    title: section?.title || 'ক্রেতারা যা বলছেন',
    items,
    // Store-wide rating, only when real reviews are on show
    summary: items.some(item => item.product) ? summary : null
  }
}

/* Brands strip */

export type BrandItem = { name: string; logo: HomeImage | null; link: string | null }

// WooCommerce product brands that have products. They are not linked: the
// storefront has no brand archive route.
async function getWooBrands (): Promise<BrandItem[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const data = await wpQuery(`
    {
      productBrands(first: 12, where: { hideEmpty: true }) {
        nodes {
          name
          image { sourceUrl altText mediaDetails { width height } }
        }
      }
    }
  `)
  return (data?.productBrands?.nodes ?? []).map(
    (node: { name: string; image: NonNullable<MediaNode>['node'] }) => ({
      name: node.name,
      logo: image({ node: node.image }, node.name),
      link: null
    })
  )
}

export async function getBrands () {
  const section = (await getSettings())?.brandsSection
  const picked: BrandItem[] = (section?.brands ?? []).flatMap(row =>
    row?.name ? [{ name: row.name, logo: image(row.logo, row.name), link: row.link || null }] : []
  )
  return {
    title: section?.title || 'যেসব ব্র্যান্ড আমাদের সঙ্গে আছে',
    brands: picked.length ? picked : await getWooBrands()
  }
}
