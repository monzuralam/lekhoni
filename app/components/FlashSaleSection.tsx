import { wpQuery } from '@/lib/wp'
import { toSiteTime } from '@/lib/site-time'
import { PRODUCT_CARD_FRAGMENT, type ProductCardData } from '@/lib/products'
import Carousel from './Carousel'
import Countdown from './Countdown'
import ProductCard from './ProductCard'

// "৩১ অক্টোবর, ২০২৬ রাত ১১:৫৯" for the screen reader label
function spokenDate (iso: string, timezone: string) {
  const options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' }
  try {
    return new Intl.DateTimeFormat('bn-BD', { ...options, timeZone: timezone }).format(new Date(iso))
  } catch {
    return new Intl.DateTimeFormat('bn-BD', options).format(new Date(iso))
  }
}

export default async function FlashSaleSection () {
  // The picked IDs come in their own request: in a query that also has a
  // products(orderby: POPULARITY) list, WPGraphQL returns the ACF
  // relationship in the wrong order
  const data = await wpQuery(`
    {
      generalSettings {
        timezone
      }
      page(id: "/", idType: URI) {
        homeShop {
          flashSaleSection {
            title
            endsAt
            products(first: 12) {
              nodes {
                databaseId
              }
            }
          }
        }
      }
    }
  `)

  const section = data?.page?.homeShop?.flashSaleSection
  const timezone: string = data?.generalSettings?.timezone || '+00:00'
  const pickedIds: number[] = (section?.products?.nodes ?? []).map(
    (node: { databaseId: number }) => node.databaseId
  )

  // Products picked in ACF (kept in their picked order), else the best-selling sale items
  let products: ProductCardData[] = []
  if (!pickedIds.length) {
    const popular = await wpQuery(`
      ${PRODUCT_CARD_FRAGMENT}
      {
        products(first: 6, where: { onSale: true, orderby: [{ field: POPULARITY, order: DESC }] }) {
          nodes {
            ...ProductCardFields
          }
        }
      }
    `)
    products = popular?.products?.nodes ?? []
  } else {
    const picked = await wpQuery(
      `
      ${PRODUCT_CARD_FRAGMENT}
      query FlashSalePicks($ids: [Int]) {
        products(first: 12, where: { include: $ids }) {
          nodes {
            ...ProductCardFields
          }
        }
      }
    `,
      { ids: pickedIds }
    )
    products = ((picked?.products?.nodes ?? []) as ProductCardData[]).sort(
      (a, b) => pickedIds.indexOf(a.databaseId) - pickedIds.indexOf(b.databaseId)
    )
  }

  if (!products.length) return null

  // Countdown: ACF end time, else the earliest product sale end date
  const endsAt = section?.endsAt
    ? toSiteTime(section.endsAt, timezone)
    : products
      .map(product => product.dateOnSaleTo)
      .filter((date): date is string => !!date)
      .sort((a, b) => Date.parse(a) - Date.parse(b))[0]

  const title = section?.title || 'ডিল অফ দ্য ডে'

  return (
    <Carousel
      aria-label={title}
      className='mt-16 border-y border-line bg-surface-2/60 py-12'
    >
      <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4'>
          <h2 className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
            <span className='grid size-10 place-items-center rounded-full bg-sale text-white'>
              <svg className='icon size-5 fill-current' aria-hidden='true'>
                <use href='#i-zap' />
              </svg>
            </span>
            {title}
          </h2>
          {endsAt && <Countdown endsAt={endsAt} label={spokenDate(endsAt, timezone)} />}
          <div className='flex shrink-0 items-center gap-2'>
            <button
              type='button'
              data-carousel-prev
              aria-label='আগের স্লাইড'
              className='grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-arrow-left' />
              </svg>
            </button>
            <button
              type='button'
              data-carousel-next
              aria-label='পরের স্লাইড'
              className='grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </button>
          </div>
        </div>
        <ul
          data-carousel-track
          tabIndex={0}
          className='scrollbar-none -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:px-6 scroll-px-4 sm:scroll-px-6'
        >
          {products.map(product => (
            <li key={product.databaseId} className='w-[72%] shrink-0 snap-start sm:w-64'>
              <ProductCard product={product} showStock />
            </li>
          ))}
        </ul>
      </div>
    </Carousel>
  )
}
