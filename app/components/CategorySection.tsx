import { wpQuery } from '@/lib/wp'
import { bn } from '@/lib/bn'
import Image from 'next/image'
import Link from 'next/link'
import Carousel from './Carousel'

type ProductCategory = {
  databaseId: number
  name: string
  slug: string
  uri: string
  count: number | null
  image: {
    sourceUrl: string
    altText: string
    mediaDetails: { width: number; height: number } | null
  } | null
}

export default async function CategorySection () {
  const data = await wpQuery(`
    fragment CategoryFields on ProductCategory {
      databaseId
      name
      slug
      uri
      count
      image {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    {
      page(id: "/", idType: URI) {
        homeShop {
          categorySection {
            categories(first: 12) {
              nodes {
                ...CategoryFields
              }
            }
          }
        }
      }
      productCategories(first: 12, where: { hideEmpty: true, parent: 0, orderby: TERM_ORDER }) {
        nodes {
          ...CategoryFields
        }
      }
    }
  `)

  // Categories picked on the Home page in ACF, falling back to the top-level ones
  const selected: ProductCategory[] =
    data?.page?.homeShop?.categorySection?.categories?.nodes ?? []
  const categories: ProductCategory[] = selected.length
    ? selected
    : (data?.productCategories?.nodes ?? []).filter(
        (category: ProductCategory) => category.slug !== 'uncategorized'
      )

  if (!categories.length) return null

  return (
    <Carousel
      aria-label='ক্যাটাগরি'
      className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16'
    >
      <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <h2 className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
          ক্যাটাগরি অনুযায়ী কিনুন
        </h2>
        <Link
          href='/shop'
          className='inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-link hover:underline'
        >
          সব ক্যাটাগরি
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-right' />
          </svg>
        </Link>
      </div>
      <ul
        data-carousel-track
        tabIndex={0}
        className='scrollbar-none -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:px-6 scroll-px-4 sm:scroll-px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0'
      >
        {categories.map(category => (
          <li
            key={category.databaseId}
            className='w-36 shrink-0 snap-start lg:w-auto'
          >
            <Link href={category.uri} className='group/cat block text-center'>
              <span className='block overflow-hidden rounded-card border border-line bg-surface-2 transition duration-300 group-hover/cat:-translate-y-1 group-hover/cat:border-accent group-hover/cat:shadow-lift'>
                {category.image?.sourceUrl ? (
                  <Image
                    src={category.image.sourceUrl}
                    alt={category.image.altText || ''}
                    width={category.image.mediaDetails?.width ?? 400}
                    height={category.image.mediaDetails?.height ?? 400}
                    sizes='(min-width: 1024px) 200px, 144px'
                    className='aspect-square w-full object-cover transition duration-500 group-hover/cat:scale-105'
                  />
                ) : (
                  <span className='block aspect-square w-full' />
                )}
              </span>
              <span className='mt-3 block font-serif text-base font-semibold text-ink transition group-hover/cat:text-link'>
                {category.name}
              </span>
              <span className='block text-sm text-muted'>
                {bn(category.count ?? 0)}টি পণ্য
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Carousel>
  )
}
