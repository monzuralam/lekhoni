import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { toSiteTime } from '@/lib/site-time'
import { PRODUCT_CARD_FRAGMENT, formatPrice, type ProductCardData } from '@/lib/products'
import { getProductReviews } from '../home/products-data'
import {
  CATEGORY_FIELDS,
  IMAGE_FIELDS,
  first,
  ids,
  isOn,
  pickedCategories,
  text,
  toImage,
  toLink,
  tone,
  type AcfImage,
  type AcfLink,
  type HomeImage,
  type HomeLink,
  type IdNodes,
  type RawCategory,
  type Tone
} from '../home-kit/acf'

// Data for the "Home – Cosmetics" template (design/home-cosmetics.html).
// Fields: the "Home – Cosmetics" ACF group on the front page
// (wp-content/themes/lekhoni/inc/acf-home-cosmetics.php, GraphQL
// `page { homeCosmetics }`). Sections are hidden when switched off or empty.

type Raw = {
  heroSection: {
    badge: string | null
    ratingText: string | null
    slides: { eyebrow: string | null; title: string | null; text: string | null; primaryLink: AcfLink; secondaryLink: AcfLink; image: AcfImage }[] | null
  } | null
  promisesSection: { enabled: boolean | null; items: { icon: string[] | null; text: string | null }[] | null } | null
  categoriesSection: { enabled: boolean | null; eyebrow: string | null; title: string | null; categories: { nodes: RawCategory[] } | null } | null
  concernsSection: {
    enabled: boolean | null
    eyebrow: string | null
    title: string | null
    allLabel: string | null
    concerns: { label: string | null; tag: { nodes: { databaseId: number }[] } | null }[] | null
    products: IdNodes
  } | null
  bestsellersSection: { enabled: boolean | null; eyebrow: string | null; title: string | null; products: IdNodes } | null
  routinesSection: {
    enabled: boolean | null
    eyebrow: string | null
    title: string | null
    text: string | null
    discount: number | null
    routines: { name: string | null; icon: string[] | null; steps: { label: string | null; product: { node: { databaseId: number } | null } | null }[] | null }[] | null
  } | null
  ingredientsSection: {
    enabled: boolean | null
    eyebrow: string | null
    title: string | null
    ingredients: { name: string | null; icon: string[] | null; tone: string[] | null; text: string | null; goodFor: string | null; link: AcfLink }[] | null
  } | null
  offerSection: { enabled: boolean | null; eyebrow: string | null; endsAt: string | null; title: string | null; text: string | null; link: AcfLink; image: AcfImage } | null
  reviewsSection: {
    enabled: boolean | null
    eyebrow: string | null
    title: string | null
    source: string[] | null
    testimonials: { name: string | null; skinType: string | null; rating: number | null; verified: boolean | null; text: string | null; product: { node: { name: string; uri: string } | null } | null }[] | null
  } | null
  gallerySection: {
    enabled: boolean | null
    eyebrow: string | null
    title: string | null
    text: string | null
    link: string | null
    images: { nodes: NonNullable<AcfImage>['node'][] } | null
  } | null
  blogSection: { enabled: boolean | null; title: string | null; linkLabel: string | null; count: number | null; category: { nodes: { databaseId: number; uri: string | null }[] } | null } | null
  subscribeSection: { enabled: boolean | null; title: string | null; text: string | null; successMessage: string | null; note: string | null } | null
}

const QUERY = `{
  generalSettings { timezone }
  page(id: "/", idType: URI) {
    homeCosmetics {
      heroSection {
        badge ratingText
        slides { eyebrow title text primaryLink { url title target } secondaryLink { url title target } image { ${IMAGE_FIELDS} } }
      }
      promisesSection { enabled items { icon text } }
      categoriesSection { enabled eyebrow title categories(first: 12) { nodes { ${CATEGORY_FIELDS} } } }
      concernsSection {
        enabled eyebrow title allLabel
        concerns { label tag { nodes { databaseId } } }
        products(first: 12) { nodes { databaseId } }
      }
      bestsellersSection { enabled eyebrow title products(first: 12) { nodes { databaseId } } }
      routinesSection {
        enabled eyebrow title text discount
        routines { name icon steps { label product { node { databaseId } } } }
      }
      ingredientsSection { enabled eyebrow title ingredients { name icon tone text goodFor link { url title target } } }
      offerSection { enabled eyebrow endsAt title text link { url title target } image { ${IMAGE_FIELDS} } }
      reviewsSection {
        enabled eyebrow title source
        testimonials { name skinType rating verified text product { node { ... on Product { name uri } } } }
      }
      gallerySection { enabled eyebrow title text link images(first: 12) { nodes { sourceUrl altText mediaDetails { width height } } } }
      blogSection { enabled title linkLabel count category { nodes { databaseId uri } } }
      subscribeSection { enabled title text successMessage note }
    }
  }
}`

async function getRaw (): Promise<{ home: Raw | null; timezone: string }> {
  'use cache'
  cacheLife('minutes')
  cacheTag('home-content', 'home-products')
  try {
    const data = await wpQuery(QUERY)
    return { home: data?.page?.homeCosmetics ?? null, timezone: data?.generalSettings?.timezone || '+00:00' }
  } catch {
    return { home: null, timezone: '+00:00' }
  }
}

/* ---------- Beauty product cards: card fields + tags + colour swatches ---------- */

export type Swatch = { name: string; color: string }

export type BeautyProduct = ProductCardData & { tagIds: number[]; swatches: Swatch[] }

const BEAUTY_FIELDS = `
  ${PRODUCT_CARD_FRAGMENT}
  fragment BeautyFields on Product {
    ...ProductCardFields
    productTags(first: 20) { nodes { databaseId } }
    ... on VariableProduct {
      attributes {
        nodes {
          name
          variation
          options
          ... on GlobalProductAttribute { terms(first: 30) { nodes { name slug swatchColor } } }
        }
      }
      # The merchant's variation order: swatches follow it (as on the product page)
      variations(first: 30, where: { orderby: [{ field: MENU_ORDER, order: ASC }] }) {
        nodes { attributes { nodes { name value } } }
      }
    }
  }
`

type RawBeauty = ProductCardData & {
  productTags: { nodes: { databaseId: number }[] } | null
  attributes?: { nodes: { name: string; variation: boolean | null; options: string[] | null; terms?: { nodes: { name: string; slug: string; swatchColor: string | null }[] } | null }[] } | null
  variations?: { nodes: { attributes: { nodes: { name: string; value: string | null }[] } | null }[] } | null
}

function toBeauty (raw: RawBeauty): BeautyProduct {
  // Colour dots for the first variation attribute whose terms have colours
  let swatches: Swatch[] = []
  for (const attribute of raw.attributes?.nodes ?? []) {
    if (!attribute.variation) continue
    // Terms and options come back sorted by name: order them by where they
    // first appear among the variations instead
    const options = (attribute.options ?? []).map(option => option.toLowerCase())
    const order: string[] = []
    for (const variation of raw.variations?.nodes ?? []) {
      const value = variation.attributes?.nodes.find(node => node.name.toLowerCase() === attribute.name.toLowerCase())?.value?.toLowerCase()
      if (value && !order.includes(value)) order.push(value)
    }
    const rank = (slug: string) => (order.includes(slug.toLowerCase()) ? order.indexOf(slug.toLowerCase()) : order.length)
    const colored = (attribute.terms?.nodes ?? [])
      .filter(term => term.swatchColor && (!options.length || options.includes(term.slug.toLowerCase())))
      .sort((a, b) => rank(a.slug) - rank(b.slug))
    if (colored.length) {
      swatches = colored.map(term => ({ name: term.name, color: term.swatchColor as string }))
      break
    }
  }
  return { ...raw, tagIds: (raw.productTags?.nodes ?? []).map(tag => tag.databaseId), swatches }
}

async function getBeautyCards (productIds: number[]): Promise<BeautyProduct[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  if (!productIds.length) return []
  try {
    const data = await wpQuery(`
      ${BEAUTY_FIELDS}
      query BeautyCards($ids: [Int], $first: Int) {
        products(first: $first, where: { include: $ids }) { nodes { ...BeautyFields } }
      }
    `, { ids: productIds, first: productIds.length })
    const byId = new Map(((data?.products?.nodes ?? []) as RawBeauty[]).map(node => [node.databaseId, node]))
    return productIds.flatMap(id => (byId.has(id) ? [toBeauty(byId.get(id) as RawBeauty)] : []))
  } catch {
    return []
  }
}

// Best sellers, optionally only products with one of the given tags
async function getBeautyList (tagIds: number[], count = 8): Promise<BeautyProduct[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  try {
    const data = await wpQuery(`
      ${BEAUTY_FIELDS}
      query BeautyList($tags: [Int], $first: Int) {
        products(first: $first, where: { tagIdIn: $tags, orderby: [{ field: POPULARITY, order: DESC }] }) { nodes { ...BeautyFields } }
      }
    `, { tags: tagIds.length ? tagIds : null, first: count })
    return ((data?.products?.nodes ?? []) as RawBeauty[]).map(toBeauty)
  } catch {
    return []
  }
}

const pickedOr = (picked: IdNodes | undefined, tagIds: number[] = []) => {
  const chosen = ids(picked)
  return chosen.length ? getBeautyCards(chosen) : getBeautyList(tagIds)
}

/* ---------- Hero ---------- */

export type BeautySlide = { eyebrow: string | null; title: string; text: string | null; primary: HomeLink; secondary: HomeLink | null; image: HomeImage }

export async function getBeautyHero () {
  const hero = (await getRaw()).home?.heroSection
  const slides: BeautySlide[] = (hero?.slides ?? []).flatMap(slide => {
    const image = toImage(slide.image, slide.title ?? '')
    return slide.title && image
      ? [{
          eyebrow: slide.eyebrow || null,
          title: slide.title,
          text: slide.text || null,
          primary: toLink(slide.primaryLink, 'এখনই কিনুন') ?? { href: '/shop', label: 'এখনই কিনুন', external: false },
          secondary: toLink(slide.secondaryLink, 'আরও দেখুন'),
          image
        }]
      : []
  })
  if (!slides.length) return null
  // The rating line uses the store's real average review rating
  const summary = hero?.ratingText ? (await getProductReviews()).summary : null
  return {
    slides,
    badge: hero?.badge?.trim() || null,
    rating: summary && hero?.ratingText ? { average: summary.average, text: hero.ratingText } : null
  }
}

/* ---------- Promise strip ---------- */

const DEFAULT_PROMISES = [
  { icon: 'award', text: '১০০% আসল পণ্য' },
  { icon: 'heart', text: 'ক্রুয়েলটি ফ্রি' },
  { icon: 'leaf', text: 'প্যারাবেন ও সালফেট মুক্ত' },
  { icon: 'rotate-ccw', text: '৭ দিনে সহজ রিটার্ন' }
]

export async function getPromises () {
  const section = (await getRaw()).home?.promisesSection
  if (!isOn(section?.enabled)) return null
  const items = (section?.items ?? []).flatMap(item => (item.text ? [{ icon: first(item.icon) || 'check', text: item.text }] : []))
  return items.length ? items.slice(0, 4) : DEFAULT_PROMISES
}

/* ---------- Category circles ---------- */

export async function getCategoryCircles () {
  const section = (await getRaw()).home?.categoriesSection
  if (!isOn(section?.enabled)) return null
  const categories = await pickedCategories(section?.categories)
  return categories.length
    ? { eyebrow: text(section?.eyebrow, 'ক্যাটাগরি'), title: text(section?.title, 'আপনার পছন্দের জগৎ বেছে নিন'), categories: categories.slice(0, 12) }
    : null
}

/* ---------- Shop by concern ---------- */

export async function getConcerns () {
  const section = (await getRaw()).home?.concernsSection
  if (!isOn(section?.enabled)) return null
  const concerns = (section?.concerns ?? []).flatMap(row =>
    row.label && row.tag?.nodes?.[0] ? [{ key: String(row.tag.nodes[0].databaseId), label: row.label, tagId: row.tag.nodes[0].databaseId }] : []
  )
  if (!concerns.length) return null
  const products = await pickedOr(section?.products, concerns.map(concern => concern.tagId))
  return products.length
    ? {
        eyebrow: text(section?.eyebrow, 'ত্বকের সমস্যা অনুযায়ী'),
        title: text(section?.title, 'আপনার ত্বকের যা দরকার'),
        allLabel: text(section?.allLabel, 'সব'),
        concerns,
        products
      }
    : null
}

/* ---------- Best sellers ---------- */

export async function getBeautyBestsellers () {
  const section = (await getRaw()).home?.bestsellersSection
  if (!isOn(section?.enabled)) return null
  const products = await pickedOr(section?.products)
  return products.length ? { eyebrow: text(section?.eyebrow, 'সবার পছন্দ'), title: text(section?.title, 'বেস্টসেলার'), products } : null
}

/* ---------- Routines ---------- */

export type RoutineStep = { label: string; product: { id: number; name: string; uri: string; image: string | null; price: string; simple: boolean } }
export type Routine = { key: string; name: string; icon: string; steps: RoutineStep[]; total: string; bundle: string | null; saving: string | null; canBundle: boolean }

// "৳৩,৪০০" in the store's own format: borrow the currency text from a product price
function money (amount: number, sample: string | null | undefined) {
  const symbol = (sample ?? '').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))).match(/^[^\d]*/)?.[0] ?? ''
  const fixed = Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
  return formatPrice(`${symbol}${Number(fixed).toLocaleString('en-IN')}`)
}

export async function getRoutines () {
  const section = (await getRaw()).home?.routinesSection
  if (!isOn(section?.enabled)) return null
  const discount = Math.min(50, Math.max(0, section?.discount ?? 15))
  const rows = section?.routines ?? []
  const productIds = [...new Set(rows.flatMap(row => (row.steps ?? []).flatMap(step => (step.product?.node ? [step.product.node.databaseId] : []))))]
  const cards = await getBeautyCards(productIds)
  const byId = new Map(cards.map(card => [card.databaseId, card]))

  const routines: Routine[] = rows.flatMap((row, index) => {
    const steps: RoutineStep[] = (row.steps ?? []).flatMap(step => {
      const card = step.product?.node ? byId.get(step.product.node.databaseId) : undefined
      return step.label && card
        ? [{
            label: step.label,
            product: {
              id: card.databaseId,
              name: card.name,
              uri: card.uri,
              image: card.image?.sourceUrl ?? null,
              price: formatPrice(card.price),
              simple: card.__typename === 'SimpleProduct' && card.stockStatus !== 'OUT_OF_STOCK'
            }
          }]
        : []
    })
    if (!row.name || steps.length < 2) return []
    const sum = steps.reduce((total, step) => total + (Number(byId.get(step.product.id)?.rawPrice) || 0), 0)
    const sample = byId.get(steps[0].product.id)?.price
    const bundle = discount > 0 && sum > 0 ? Math.round(sum * (1 - discount / 100)) : null
    return [{
      key: `r${index}`,
      name: row.name,
      icon: first(row.icon) || 'sun',
      steps,
      total: money(sum, sample),
      bundle: bundle !== null ? money(bundle, sample) : null,
      saving: bundle !== null ? money(sum - bundle, sample) : null,
      // The cart discount (inc/routines.php) needs every product addable as is
      canBundle: steps.every(step => step.product.simple)
    }]
  })
  return routines.length
    ? {
        eyebrow: text(section?.eyebrow, `${routines[0].steps.length.toLocaleString('bn-BD')} ধাপের রুটিন`),
        title: text(section?.title, 'আপনার রুটিন তৈরি করুন'),
        text: section?.text?.trim() || null,
        discount,
        routines
      }
    : null
}

/* ---------- Ingredients ---------- */

export type Ingredient = { name: string; icon: string; tone: Tone; text: string; goodFor: string[]; link: HomeLink | null }

export async function getIngredients () {
  const section = (await getRaw()).home?.ingredientsSection
  if (!isOn(section?.enabled)) return null
  const ingredients: Ingredient[] = (section?.ingredients ?? []).flatMap(row =>
    row.name && row.text
      ? [{
          name: row.name,
          icon: first(row.icon) || 'sparkles',
          tone: tone(row.tone),
          text: row.text,
          goodFor: (row.goodFor ?? '').split(/[,،]/).map(item => item.trim()).filter(Boolean),
          link: toLink(row.link, `${row.name} আছে এমন পণ্য`)
        }]
      : []
  )
  return ingredients.length
    ? { eyebrow: text(section?.eyebrow, 'উপাদান'), title: text(section?.title, 'কী আছে ভেতরে, জেনে কিনুন'), ingredients }
    : null
}

/* ---------- Offer banner ---------- */

export async function getOffer () {
  const { home, timezone } = await getRaw()
  const offer = home?.offerSection
  if (!isOn(offer?.enabled) || !offer?.title) return null
  const endsAt = offer.endsAt ? toSiteTime(offer.endsAt, timezone) : null
  return {
    eyebrow: offer.eyebrow || null,
    title: offer.title,
    text: offer.text || null,
    link: toLink(offer.link, 'কেনাকাটা শুরু করুন'),
    image: toImage(offer.image, ''),
    endsAt,
    timezone
  }
}

/* ---------- Reviews ---------- */

export type BeautyReview = { id: string; name: string; skinType: string | null; rating: number; text: string; verified: boolean; product: { name: string; uri: string } | null }

export async function getBeautyReviews () {
  const section = (await getRaw()).home?.reviewsSection
  if (!isOn(section?.enabled)) return null
  const source = first(section?.source) || 'auto'
  const testimonials: BeautyReview[] = (section?.testimonials ?? []).flatMap((row, index) =>
    row.name && row.text
      ? [{
          id: `t${index}`,
          name: row.name,
          skinType: row.skinType || null,
          rating: Math.min(5, Math.max(1, Math.round(row.rating ?? 5))),
          text: row.text,
          verified: row.verified !== false,
          product: row.product?.node ? { name: row.product.node.name, uri: row.product.node.uri } : null
        }]
      : []
  )
  const { reviews, summary } = source === 'testimonials' ? { reviews: [], summary: null } : await getProductReviews()
  const fromReviews: BeautyReview[] = reviews.map(review => ({
    id: review.id,
    name: review.name,
    skinType: null,
    rating: review.rating,
    text: review.text,
    verified: false,
    product: review.product
  }))
  const items =
    source === 'reviews' ? fromReviews
      : source === 'testimonials' ? testimonials
        : source === 'both' ? [...testimonials, ...fromReviews]
          : fromReviews.length ? fromReviews : testimonials
  return items.length
    ? {
        eyebrow: text(section?.eyebrow, 'রিভিউ'),
        title: text(section?.title, 'তাঁরা যা বলছেন'),
        items,
        summary: fromReviews.length && items.some(item => item.id.startsWith('review-')) ? summary : null
      }
    : null
}

/* ---------- Customer photo gallery ---------- */

export async function getGallery () {
  const section = (await getRaw()).home?.gallerySection
  if (!isOn(section?.enabled)) return null
  const images = (section?.images?.nodes ?? []).flatMap(node => {
    const image = toImage({ node }, '')
    return image ? [image] : []
  })
  return images.length
    ? {
        eyebrow: text(section?.eyebrow, '#লেখনীবিউটি'),
        title: text(section?.title, 'আপনাদের তোলা ছবি'),
        text: section?.text?.trim() || null,
        link: section?.link?.trim() || null,
        images
      }
    : null
}

/* ---------- Blog + newsletter ---------- */

export async function getBeautyBlogSettings () {
  const section = (await getRaw()).home?.blogSection
  if (!isOn(section?.enabled)) return null
  const category = section?.category?.nodes?.[0] ?? null
  return {
    title: text(section?.title, 'বিউটি টিপস'),
    linkLabel: text(section?.linkLabel, 'সব লেখা'),
    count: Math.min(12, Math.max(1, Number(section?.count) || 3)),
    category
  }
}

export async function getBeautyClub () {
  const section = (await getRaw()).home?.subscribeSection
  if (!isOn(section?.enabled)) return null
  return {
    title: text(section?.title, 'বিউটি ক্লাবে যোগ দিন'),
    text: text(section?.text, 'প্রথম অর্ডারে ১০% ছাড়, নতুন পণ্যের খবর আর ত্বকের যত্নের টিপস, মাসে দুবার।'),
    successMessage: text(section?.successMessage, 'স্বাগতম! বিউটি ক্লাবে যোগ দেওয়ার জন্য ধন্যবাদ।'),
    note: section?.note?.trim() || 'আমরা আপনার ইমেইল কারো সঙ্গে শেয়ার করি না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।'
  }
}
