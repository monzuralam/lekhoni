import Carousel from '../Carousel'
import ProductCard from '../ProductCard'
import { getBestSellers } from './products-data'

// Port of the BestSellersCarousel section of design/home-shop.html. ACF
// "Home Products" → Best Sellers Carousel sets the title and picked products;
// empty picks fall back to the 8 best-selling products. Hidden when empty.

export default async function BestSellersCarousel () {
  const { title, products } = await getBestSellers()
  if (!products.length) return null

  return (
    <Carousel aria-label={title} className='mx-auto mt-16 w-full max-w-site px-4 sm:px-6'>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <h2 className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>{title}</h2>
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
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Carousel>
  )
}
