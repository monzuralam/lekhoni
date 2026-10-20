import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { toSiteTime } from '@/lib/site-time'
import type { ProductCardData } from '@/lib/products'
import { getProductCards } from '../product/data'
import { getWooBrands, type BrandItem } from '../home/products-data'
import {
  CATEGORY_FIELDS,
  IMAGE_FIELDS,
  first,
  getCategoryProducts,
  getProductList,
  ids,
  isOn,
  pickedCategories,
  text,
  toCategory,
  toImage,
  toLink,
  tone,
  urlLink,
  type AcfImage,
  type AcfLink,
  type HomeCategory,
  type HomeImage,
  type HomeLink,
  type IdNodes,
  type ProductList,
  type RawCategory,
  type Tone
} from '../home-kit/acf'

// Data for the "Home – E-commerce" template (design/home-ecommerce.html).
// Fields: the "Home – E-commerce" ACF group on the front page
// (wp-content/themes/lekhoni/inc/acf-home-ecommerce.php, GraphQL
// `page { homeEcommerce }`). Every section falls back to automatic content
// and is hidden when it has nothing to show or is switched off.

type Raw = {
  heroSection: {
    showDepartments: boolean | null
    menuTitle: string | null
    slides: { eyebrow: string | null; title: string | null; text: string | null; tone: string[] | null; link: AcfLink; image: AcfImage }[] | null
    sideBanners: { eyebrow: string | null; title: string | null; image: AcfImage; link: string | null; tone: string[] | null }[] | null
  } | null
  servicesSection: { enabled: boolean | null; items: { icon: string[] | null; title: string | null; text: string | null }[] | null } | null
  departmentsSection: { enabled: boolean | null; title: string | null; categories: { nodes: RawCategory[] } | null } | null
  dealsSection: { enabled: boolean | null; title: string | null; endsAt: string | null; products: IdNodes } | null
  tabsSection: {
    enabled: boolean | null
    title: string | null
    newLabel: string | null
    bestLabel: string | null
    topLabel: string | null
    newProducts: IdNodes
    bestProducts: IdNodes
    topProducts: IdNodes
  } | null
  wideBanner: { enabled: boolean | null; eyebrow: string | null; couponCode: string | null; title: string | null; text: string | null; link: AcfLink } | null
  categoryRows: {
    // Taxonomy fields are lists in GraphQL, even single-term ones
    category: { nodes: RawCategory[] } | null
    title: string | null
    icon: string[] | null
    bannerEyebrow: string | null
    bannerTitle: string | null
    tone: string[] | null
    bannerImage: AcfImage
    products: IdNodes
  }[] | null
  promoBanners: { eyebrow: string | null; title: string | null; image: AcfImage; link: string | null; tone: string[] | null }[] | null
  listsSection: { enabled: boolean | null; topTitle: string | null; newTitle: string | null; saleTitle: string | null } | null
  brandsSection: { enabled: boolean | null; title: string | null; brands: { name: string | null; logo: AcfImage; link: string | null }[] | null } | null
  showRecentlyViewed: boolean | null
  subscribeSection: { enabled: boolean | null; title: string | null; text: string | null; successMessage: string | null } | null
}

const QUERY = `{
  generalSettings { timezone }
  page(id: "/", idType: URI) {
    homeEcommerce {
      heroSection {
        showDepartments
        menuTitle
        slides { eyebrow title text tone link { url title target } image { ${IMAGE_FIELDS} } }
        sideBanners { eyebrow title link tone image { ${IMAGE_FIELDS} } }
      }
      servicesSection { enabled items { icon title text } }
      departmentsSection { enabled title categories(first: 16) { nodes { ${CATEGORY_FIELDS} } } }
      dealsSection { enabled title endsAt products(first: 12) { nodes { databaseId } } }
      tabsSection {
        enabled title newLabel bestLabel topLabel
        newProducts(first: 8) { nodes { databaseId } }
        bestProducts(first: 8) { nodes { databaseId } }
        topProducts(first: 8) { nodes { databaseId } }
      }
      wideBanner { enabled eyebrow couponCode title text link { url title target } }
      categoryRows {
        category { nodes { ${CATEGORY_FIELDS} } }
        title icon bannerEyebrow bannerTitle tone
        bannerImage { ${IMAGE_FIELDS} }
        products(first: 10) { nodes { databaseId } }
      }
      promoBanners { eyebrow title link tone image { ${IMAGE_FIELDS} } }
      listsSection { enabled topTitle newTitle saleTitle }
      brandsSection { enabled title brands { name link logo { ${IMAGE_FIELDS} } } }
      showRecentlyViewed
      subscribeSection { enabled title text successMessage }
    }
  }
}`

async function getRaw (): Promise<{ home: Raw | null; timezone: string }> {
  'use cache'
  cacheLife('minutes')
  cacheTag('home-content', 'home-products')
  try {
    const data = await wpQuery(QUERY)
    return { home: data?.page?.homeEcommerce ?? null, timezone: data?.generalSettings?.timezone || '+00:00' }
  } catch {
    // WordPress down or the field group missing: every section falls back
    return { home: null, timezone: '+00:00' }
  }
}

// Picked products in their order, else an automatic list
const pickedOr = (picked: IdNodes | undefined, list: ProductList, count = 8): Promise<ProductCardData[]> => {
  const chosen = ids(picked)
  return chosen.length ? getProductCards(chosen) : getProductList(list, count)
}

/* ---------- Hero ---------- */

export type HeroSlide = { eyebrow: string | null; title: string; text: string | null; tone: Tone; link: HomeLink; image: HomeImage }
export type SideBanner = { eyebrow: string | null; title: string; image: HomeImage | null; link: HomeLink | null; tone: Tone }

export async function getHero () {
  const { home } = await getRaw()
  const hero = home?.heroSection
  const slides: HeroSlide[] = (hero?.slides ?? []).flatMap(slide => {
    const image = toImage(slide.image, slide.title ?? '')
    return slide.title && image
      ? [{
          eyebrow: slide.eyebrow || null,
          title: slide.title,
          text: slide.text || null,
          tone: tone(slide.tone),
          link: toLink(slide.link, 'এখনই কিনুন') ?? { href: '/shop', label: 'এখনই কিনুন', external: false },
          image
        }]
      : []
  })
  const sideBanners: SideBanner[] = (hero?.sideBanners ?? []).flatMap(banner =>
    banner.title
      ? [{ eyebrow: banner.eyebrow || null, title: banner.title, image: toImage(banner.image, ''), link: urlLink(banner.link, banner.title), tone: tone(banner.tone) }]
      : []
  )
  const showMenu = isOn(hero?.showDepartments)
  return {
    slides,
    sideBanners: sideBanners.slice(0, 2),
    menu: showMenu ? { title: text(hero?.menuTitle, 'সব ডিপার্টমেন্ট'), departments: await getDepartments() } : null
  }
}

/* ---------- Services ---------- */

const DEFAULT_SERVICES = [
  { icon: 'truck', title: 'সারা দেশে ডেলিভারি', text: 'ঢাকায় ২৪ ঘণ্টায়, বাইরে ৩–৫ দিনে' },
  { icon: 'rotate-ccw', title: '৭ দিনে রিটার্ন', text: 'ঝামেলা ছাড়া পণ্য ফেরত' },
  { icon: 'shield-check', title: '১০০% আসল পণ্য', text: 'অফিশিয়াল ওয়ারেন্টিসহ' },
  { icon: 'credit-card', title: 'নিরাপদ পেমেন্ট', text: 'বিকাশ, নগদ, কার্ড, ক্যাশ' }
]

export async function getServices () {
  const section = (await getRaw()).home?.servicesSection
  if (!isOn(section?.enabled)) return null
  const items = (section?.items ?? []).flatMap(item =>
    item.title ? [{ icon: first(item.icon) || 'check', title: item.title, text: item.text || '' }] : []
  )
  return items.length ? items.slice(0, 4) : DEFAULT_SERVICES
}

/* ---------- Departments ---------- */

export async function getDepartments (): Promise<HomeCategory[]> {
  const section = (await getRaw()).home?.departmentsSection
  return pickedCategories(section?.categories)
}

export async function getDepartmentGrid () {
  const section = (await getRaw()).home?.departmentsSection
  if (!isOn(section?.enabled)) return null
  const departments = await getDepartments()
  return departments.length ? { title: text(section?.title, 'ডিপার্টমেন্ট'), departments } : null
}

/* ---------- Deals ---------- */

export async function getDeals () {
  const { home, timezone } = await getRaw()
  const section = home?.dealsSection
  if (!isOn(section?.enabled)) return null
  const products = await pickedOr(section?.products, 'sale')
  if (!products.length) return null
  // ACF end time, else the earliest product sale end date
  const endsAt = section?.endsAt
    ? toSiteTime(section.endsAt, timezone)
    : products.map(product => product.dateOnSaleTo).filter((date): date is string => !!date).sort((a, b) => Date.parse(a) - Date.parse(b))[0] ?? null
  return { title: text(section?.title, 'আজকের ডিল'), endsAt, timezone, products }
}

/* ---------- Popular products tabs ---------- */

export async function getTabs () {
  const section = (await getRaw()).home?.tabsSection
  if (!isOn(section?.enabled)) return null
  const [newest, best, top] = await Promise.all([
    pickedOr(section?.newProducts, 'newest'),
    pickedOr(section?.bestProducts, 'popular'),
    pickedOr(section?.topProducts, 'rating')
  ])
  const tabs = [
    { key: 'new', label: text(section?.newLabel, 'নতুন এসেছে'), products: newest },
    { key: 'best', label: text(section?.bestLabel, 'বেস্টসেলার'), products: best },
    { key: 'top', label: text(section?.topLabel, 'সেরা রেটিং'), products: top }
  ].filter(tab => tab.products.length)
  return tabs.length ? { title: text(section?.title, 'জনপ্রিয় পণ্য'), tabs } : null
}

/* ---------- Wide coupon banner ---------- */

export async function getWideBanner () {
  const banner = (await getRaw()).home?.wideBanner
  if (!isOn(banner?.enabled) || !banner?.title) return null
  return {
    eyebrow: banner.eyebrow || null,
    title: banner.title,
    text: banner.text || null,
    code: banner.couponCode?.trim() || null,
    link: toLink(banner.link, 'কেনাকাটা শুরু করুন')
  }
}

/* ---------- Category rows ---------- */

export type CategoryRow = {
  key: string
  title: string
  icon: string | null
  link: HomeLink
  banner: { eyebrow: string | null; title: string; image: HomeImage | null; tone: Tone } | null
  products: ProductCardData[]
}

export async function getCategoryRows (): Promise<CategoryRow[]> {
  const rows = (await getRaw()).home?.categoryRows ?? []
  const built = await Promise.all(rows.map(async (row, index): Promise<CategoryRow | null> => {
    const raw = row.category?.nodes?.[0]
    if (!raw) return null
    const category = toCategory(raw)
    const picked = ids(row.products)
    const products = picked.length ? await getProductCards(picked) : await getCategoryProducts(category.id, 8)
    if (!products.length) return null
    const title = text(row.title, category.name)
    return {
      key: `${category.id}-${index}`,
      title,
      icon: first(row.icon) || category.icon,
      link: { href: category.href, label: `সব ${category.name}`, external: false },
      banner: row.bannerTitle
        ? { eyebrow: row.bannerEyebrow || null, title: row.bannerTitle, image: toImage(row.bannerImage, ''), tone: tone(row.tone) }
        : null,
      products
    }
  }))
  return built.filter((row): row is CategoryRow => row !== null)
}

/* ---------- Promo banners ---------- */

export async function getPromoBanners () {
  const banners = (await getRaw()).home?.promoBanners ?? []
  return banners.flatMap(banner =>
    banner.title
      ? [{ eyebrow: banner.eyebrow || null, title: banner.title, image: toImage(banner.image, ''), link: urlLink(banner.link, banner.title), tone: tone(banner.tone) }]
      : []
  )
}

/* ---------- Short product lists ---------- */

export async function getProductLists () {
  const section = (await getRaw()).home?.listsSection
  if (!isOn(section?.enabled)) return null
  const [top, newest, sale] = await Promise.all([
    getProductList('rating', 3),
    getProductList('newest', 3),
    getProductList('sale', 3)
  ])
  const lists = [
    { key: 'top', icon: 'star', title: text(section?.topTitle, 'সেরা রেটিং'), products: top },
    { key: 'new', icon: 'sparkles', title: text(section?.newTitle, 'নতুন এসেছে'), products: newest },
    { key: 'sale', icon: 'tag', title: text(section?.saleTitle, 'অফারে আছে'), products: sale }
  ].filter(list => list.products.length)
  return lists.length ? lists : null
}

/* ---------- Brands ---------- */

export async function getBrandGrid (): Promise<{ title: string; brands: BrandItem[] } | null> {
  const section = (await getRaw()).home?.brandsSection
  if (!isOn(section?.enabled)) return null
  const picked: BrandItem[] = (section?.brands ?? []).flatMap(row =>
    row.name
      ? [{
          name: row.name,
          logo: (() => {
            const image = toImage(row.logo, row.name)
            return image ? { sourceUrl: image.src, altText: image.alt, width: image.width, height: image.height } : null
          })(),
          link: row.link || null
        }]
      : []
  )
  const brands = picked.length ? picked : await getWooBrands()
  return brands.length ? { title: text(section?.title, 'জনপ্রিয় ব্র্যান্ড'), brands } : null
}

/* ---------- Recently viewed + newsletter ---------- */

export async function getFooterSections () {
  const home = (await getRaw()).home
  const subscribe = home?.subscribeSection
  return {
    recentlyViewed: isOn(home?.showRecentlyViewed),
    subscribe: isOn(subscribe?.enabled)
      ? {
          title: text(subscribe?.title, 'অফারের খবর সবার আগে'),
          text: text(subscribe?.text, 'সাবস্ক্রাইব করলেই প্রথম অর্ডারে ছাড়ের কুপন। সপ্তাহে একটির বেশি ইমেইল নয়।'),
          successMessage: text(subscribe?.successMessage, 'সাবস্ক্রাইব করার জন্য ধন্যবাদ!')
        }
      : null
  }
}
