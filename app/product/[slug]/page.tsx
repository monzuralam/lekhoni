import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { bn } from '@/lib/bn'
import { formatPrice, plainText } from '@/lib/products'
import Breadcrumbs from '@/app/components/layout/Breadcrumbs'
import {
  getCategoryProducts,
  getProduct,
  getProductSlugs,
  type ProductData
} from '@/app/components/product/data'
import ProductGallery from '@/app/components/product/ProductGallery'
import { ProductPrice, StockStatusLine } from '@/app/components/product/ProductPrice'
import ProductPurchase from '@/app/components/product/ProductPurchase'
import ProductReviews, { Stars } from '@/app/components/product/ProductReviews'
import ProductSelection from '@/app/components/product/ProductSelection'
import ProductTabs, { type ProductTab } from '@/app/components/product/ProductTabs'
import RecentlyViewed from '@/app/components/product/RecentlyViewed'
import RelatedProducts from '@/app/components/product/RelatedProducts'
import ShareButtons from '@/app/components/product/ShareButtons'
import { findVariation, saving, stockLabel, variantAttributes } from '@/app/components/product/utils'

// Port of design/product.html. Product data is cached with `use cache`
// (see data.ts); every known slug is prerendered, new ones on first visit.

export async function generateStaticParams () {
  const slugs = await getProductSlugs()
  // cacheComponents needs at least one entry
  return slugs.length ? slugs.map(slug => ({ slug })) : [{ slug: 'cap' }]
}

export async function generateMetadata ({ params }: PageProps<'/product/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'পণ্যটি পাওয়া যায়নি' }

  const description = plainText(product.shortDescription || product.description).slice(0, 160)
  const image = product.image?.sourceUrl

  return {
    title: product.name,
    description,
    alternates: { canonical: product.uri },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: product.uri,
      images: image ? [{ url: image, alt: product.image?.altText || product.name }] : undefined
    }
  }
}

// Absolute URLs for JSON-LD when the public site URL is configured
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

const CURRENCIES: Record<string, string> = { '£': 'GBP', '৳': 'BDT', $: 'USD', '€': 'EUR', '₹': 'INR' }

function currencyOf (price: string | null | undefined) {
  const symbol = formatPrice(price).replace(/[\s\d০-৯.,-]/g, '').charAt(0)
  return CURRENCIES[symbol]
}

const AVAILABILITY = {
  IN_STOCK: 'https://schema.org/InStock',
  OUT_OF_STOCK: 'https://schema.org/OutOfStock',
  ON_BACKORDER: 'https://schema.org/BackOrder'
}

function jsonLd (product: ProductData, crumbs: { label: string; href?: string }[]) {
  const priceCurrency = currencyOf(product.price)
  const availability = AVAILABILITY[product.stockStatus ?? 'IN_STOCK']
  const variationPrices = (product.variations?.nodes ?? [])
    .map(variation => Number(variation.rawPrice))
    .filter(price => price > 0)
  const price = Number(product.rawPrice)

  const offers = variationPrices.length
    ? {
        '@type': 'AggregateOffer',
        lowPrice: Math.min(...variationPrices),
        highPrice: Math.max(...variationPrices),
        offerCount: variationPrices.length,
        priceCurrency,
        availability
      }
    : price > 0
      ? {
          '@type': 'Offer',
          price,
          priceCurrency,
          availability,
          url: SITE_URL + product.uri
        }
      : undefined

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: plainText(product.shortDescription || product.description),
    sku: product.sku || undefined,
    image: [product.image, ...(product.galleryImages?.nodes ?? [])]
      .flatMap(image => (image?.sourceUrl ? [image.sourceUrl] : [])),
    category: product.productCategories?.nodes?.[0]?.name,
    offers,
    aggregateRating: product.reviewCount
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.reviewCount
        }
      : undefined
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ label: 'হোম', href: '/' }, ...crumbs].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href ? SITE_URL + crumb.href : undefined
    }))
  }

  // Escape "<" so WordPress text can never close the script tag
  return JSON.stringify([breadcrumbLd, productLd]).replace(/</g, '\\u003c')
}

function additionalInfo (product: ProductData) {
  const rows = (product.attributes?.nodes ?? [])
    .filter(attribute => attribute.visible !== false && attribute.options?.length)
    .map(attribute => {
      const terms = new Map(attribute.terms?.nodes.map(term => [term.slug, term.name]))
      return {
        label: attribute.label || attribute.name,
        value: (attribute.options ?? []).map(option => terms.get(option) ?? option).join(', ')
      }
    })
  if (product.weight) rows.push({ label: 'ওজন', value: bn(product.weight) })
  const size = [product.length, product.width, product.height].filter(Boolean)
  if (size.length) rows.push({ label: 'মাপ', value: bn(size.join(' × ')) })
  return rows
}

export default async function ProductPage ({ params }: PageProps<'/product/[slug]'>) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const category = product.productCategories?.nodes?.[0]
  const crumbs = [
    { label: 'শপ', href: '/shop' },
    ...(category ? [{ label: category.name, href: category.uri }] : []),
    { label: product.name }
  ]

  const images = [product.image, ...(product.galleryImages?.nodes ?? [])].flatMap(image =>
    image?.sourceUrl ? [image] : []
  )
  const save = product.onSale ? saving(product) : null
  const badge = save ? `−${bn(save.percent)}% ছাড়` : product.onSale ? 'অফার' : null

  const attributes = variantAttributes(product.attributes?.nodes ?? [])
  const variations = product.variations?.nodes ?? []
  const isVariable = product.__typename === 'VariableProduct'
  const defaultSelection = Object.fromEntries(
    (product.defaultAttributes?.nodes ?? [])
      .filter(item => item.value)
      .map(item => [item.name, item.value])
  )
  const initialVariation = isVariable
    ? findVariation(variations, attributes, defaultSelection)
    : null

  const rating = product.averageRating ?? 0
  const reviewCount = product.reviewCount ?? 0
  const reviews = product.reviews?.edges ?? []
  const info = additionalInfo(product)

  let related = product.related?.nodes ?? []
  if (!related.length && category) {
    related = await getCategoryProducts(category.slug, product.databaseId)
  }

  const tabs: ProductTab[] = [
    {
      key: 'description',
      label: 'বিবরণ',
      panel: product.description ? (
        <div
          className='entry-content prose'
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      ) : (
        <p className='text-ink-2'>এই পণ্যের বিস্তারিত বিবরণ শিগগিরই যোগ করা হবে।</p>
      )
    },
    ...(info.length
      ? [
          {
            key: 'specs',
            label: 'স্পেসিফিকেশন',
            panel: (
              <div className='entry-content prose'>
                <figure className='wp-block-table'>
                  <table>
                    <caption className='sr-only'>পণ্যের স্পেসিফিকেশন</caption>
                    <tbody>
                      {info.map(row => (
                        <tr key={row.label}>
                          <th scope='row'>{row.label}</th>
                          <td>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </figure>
              </div>
            )
          }
        ]
      : []),
    {
      key: 'reviews',
      label: `রিভিউ (${bn(reviewCount)})`,
      wide: true,
      panel: (
        <ProductReviews
          productId={product.databaseId}
          averageRating={rating}
          reviewCount={reviewCount}
          reviews={reviews}
          reviewsAllowed={product.reviewsAllowed !== false}
        />
      )
    }
  ]

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: jsonLd(product, crumbs) }}
      />

      <div className='mx-auto w-full max-w-site px-4 pt-8 sm:px-6'>
        <Breadcrumbs items={crumbs} />
      </div>

      <ProductSelection initial={initialVariation}>
        <section className='mx-auto mt-6 grid w-full max-w-site gap-10 px-4 sm:px-6 lg:grid-cols-2'>
          <ProductGallery images={images} name={product.name} badge={badge} />

          <div className='flex flex-col gap-4'>
            {category && (
              <Link
                href={category.uri}
                className='w-fit text-xs font-semibold uppercase tracking-widest text-link hover:underline'
              >
                {category.name}
              </Link>
            )}
            <h1 className='text-3xl text-ink sm:text-4xl'>{product.name}</h1>
            <div className='flex flex-wrap items-center gap-2'>
              <Stars rating={rating} />
              <a
                href='?tab=reviews#product-tabs'
                data-tab-link='reviews'
                className='text-sm text-muted underline-offset-4 hover:text-link hover:underline'
              >
                {reviewCount
                  ? `${bn(rating.toFixed(1))} (${bn(reviewCount)}টি রিভিউ)`
                  : 'এখনো রিভিউ নেই · প্রথম রিভিউ লিখুন'}
              </a>
            </div>

            <ProductPrice
              product={{
                price: product.price,
                regularPrice: product.regularPrice,
                rawPrice: product.rawPrice,
                rawRegularPrice: product.rawRegularPrice
              }}
            />

            {product.shortDescription && (
              <div
                className='text-[1.05rem] leading-relaxed text-ink-2 [&_p]:m-0'
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            )}

            {product.__typename === 'ExternalProduct' && product.externalUrl ? (
              <div className='flex flex-wrap items-center gap-3 pt-1'>
                <a
                  href={product.externalUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
                >
                  {product.buttonText || 'এখনই কিনুন'}
                  <svg className='icon size-4.5' aria-hidden='true'>
                    <use href='#i-arrow-right' />
                  </svg>
                </a>
              </div>
            ) : product.__typename === 'GroupProduct' ? (
              <GroupedProducts product={product} />
            ) : (
              <ProductPurchase
                productId={product.databaseId}
                name={product.name}
                stockStatus={product.stockStatus}
                stockQuantity={product.stockQuantity}
                manageStock={product.manageStock}
                attributes={isVariable ? attributes : []}
                variations={variations}
                defaultSelection={defaultSelection}
              />
            )}

            <ul className='space-y-3 rounded-card border border-line bg-surface-2/60 p-5 text-[0.95rem] text-ink-2'>
              {product.stockStatus !== undefined && product.__typename !== 'GroupProduct' && (
                <StockStatusLine
                  product={{
                    stockStatus: product.stockStatus,
                    stockQuantity: product.stockQuantity,
                    manageStock: product.manageStock
                  }}
                />
              )}
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 text-link'>
                  <svg className='icon size-5' aria-hidden='true'>
                    <use href='#i-truck' />
                  </svg>
                </span>
                <span>
                  <strong className='text-ink'>ঢাকায় ২৪ ঘণ্টায় ডেলিভারি</strong> · ঢাকার বাইরে ৩ থেকে ৫ কর্মদিবস। ৳১,০০০-এর বেশি অর্ডারে ডেলিভারি ফ্রি।
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 text-link'>
                  <svg className='icon size-5' aria-hidden='true'>
                    <use href='#i-rotate-ccw' />
                  </svg>
                </span>
                <span>
                  <strong className='text-ink'>৭ দিনে সহজ রিটার্ন</strong> · অব্যবহৃত পণ্য ফেরত দেওয়া যাবে।
                </span>
              </li>
            </ul>

            <div className='flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4'>
              {product.sku ? <p className='text-sm text-muted'>SKU: {product.sku}</p> : <span />}
              <ShareButtons path={product.uri} title={product.name} />
            </div>
          </div>
        </section>
      </ProductSelection>

      <ProductTabs tabs={tabs} />

      <RelatedProducts products={related} />

      <RecentlyViewed currentId={product.databaseId} />
    </>
  )
}

function GroupedProducts ({ product }: { product: ProductData }) {
  const children = product.products?.nodes ?? []
  if (!children.length) return null

  return (
    <div>
      <p className='mb-2 text-sm font-medium text-ink'>এই সেটে যা আছে</p>
      <ul className='divide-y divide-line rounded-card border border-line bg-surface'>
        {children.map(child => (
          <li key={child.databaseId} className='flex items-center gap-3 p-3'>
            {child.image?.sourceUrl ? (
              <Image
                src={child.image.sourceUrl}
                alt=''
                width={64}
                height={64}
                className='size-16 shrink-0 rounded-xl bg-surface-2 object-cover'
              />
            ) : (
              <span className='size-16 shrink-0 rounded-xl bg-surface-2' />
            )}
            <span className='min-w-0 flex-1'>
              <Link
                href={child.uri}
                className='line-clamp-2 text-sm font-semibold leading-snug text-ink transition hover:text-link'
              >
                {child.name}
              </Link>
              <span className='text-sm font-bold text-ink-2'>{formatPrice(child.price)}</span>
              {child.stockStatus === 'OUT_OF_STOCK' && (
                <span className='ml-2 text-xs font-semibold text-danger'>{stockLabel(child.stockStatus)}</span>
              )}
            </span>
            <Link
              href={child.uri}
              className='inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent hover:text-accent-ink'
            >
              দেখুন
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
