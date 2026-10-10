import { wpQuery } from '@/lib/wp'
import Image from 'next/image'
import Link from 'next/link'

export default async function HeroSlider () {
  const sliderData = await wpQuery(`
        {
            page(id: "/", idType: URI) {
                template {
                __typename
                }
                isFrontPage
                homeShop {
                sliderSection {
                    sliderItem {
                    eyebrow
                    title
                    description
                    image {
                        node {
                        altText
                        sourceUrl
                        }
                    }
                    buyNowUrl
                    collectionUrl
                    }
                }
                }
            }
        } 
    `)
  const sliderItems =
    (await sliderData?.page?.homeShop?.sliderSection?.sliderItem) || []

  return (
    <section
      data-carousel
      data-autoplay='6000'
      data-loop
      aria-label='প্রধান অফার'
      className='group/hero mx-auto w-full max-w-site px-4 sm:px-6 relative mt-6'
    >
      <div className='relative overflow-hidden rounded-card border border-line'>
        <ul
          data-carousel-track
          tabIndex={0}
          className='scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth'
        >
          {sliderItems.map((sliderItem, index) => {
            const isFirst = index === 0
            const Heading = isFirst ? 'h1' : 'h2'
            const image = sliderItem.image?.node

            return (
              <li key={index} className='w-full shrink-0 snap-center'>
                <div className='grid h-full items-center gap-6 bg-accent/10 px-6 py-10 sm:px-12 md:grid-cols-2 md:px-20 md:py-14'>
                  <div className='text-center md:text-left'>
                    {sliderItem.eyebrow && (
                      <p className='text-xs font-semibold uppercase tracking-widest text-link'>
                        {sliderItem.eyebrow}
                      </p>
                    )}

                    {sliderItem.title && (
                      <Heading className='mt-3 text-3xl text-ink sm:text-5xl sm:leading-[1.25]'>
                        {sliderItem.title}
                      </Heading>
                    )}

                    {sliderItem.description && (
                      <p className='mt-4 text-lg text-ink-2'>
                        {sliderItem.description}
                      </p>
                    )}

                    {(sliderItem.buyNowUrl || sliderItem.collectionUrl) && (
                      <div className='mt-6 flex flex-wrap justify-center gap-3 md:justify-start'>
                        {sliderItem.buyNowUrl && (
                          <Link
                            href={sliderItem.buyNowUrl}
                            className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
                          >
                            এখনই কিনুন
                            <svg className='icon size-4' aria-hidden='true'>
                              <use href='#i-arrow-right' />
                            </svg>
                          </Link>
                        )}

                        {sliderItem.collectionUrl && (
                          <Link
                            href={sliderItem.collectionUrl}
                            className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95'
                          >
                            কালেকশন দেখুন
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  <Image
                    src={image?.sourceUrl ?? '/assets/img/hero-1.svg'}
                    alt={image?.altText || sliderItem.title || ''}
                    width={image?.mediaDetails?.width ?? 900}
                    height={image?.mediaDetails?.height ?? 700}
                    loading={isFirst ? 'eager' : 'lazy'}
                    fetchPriority={isFirst ? 'high' : 'auto'}
                    className='mx-auto aspect-[9/7] w-full max-w-md object-contain md:max-w-none'
                  />
                </div>
              </li>
            )
          })}
        </ul>
        <button
          type='button'
          data-carousel-prev
          aria-label='আগের স্লাইড'
          className='grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40 absolute left-3 top-1/2 -translate-y-1/2 max-md:hidden'
        >
          <svg className='icon size-4.5' aria-hidden='true'>
            <use href='#i-arrow-left' />
          </svg>
        </button>
        <button
          type='button'
          data-carousel-next
          aria-label='পরের স্লাইড'
          className='grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40 absolute right-3 top-1/2 -translate-y-1/2 max-md:hidden'
        >
          <svg className='icon size-4.5' aria-hidden='true'>
            <use href='#i-arrow-right' />
          </svg>
        </button>
      </div>
      <div className='mt-4 flex items-center justify-center gap-4'>
        <div data-carousel-dots className='flex items-center gap-2'></div>
        <button
          type='button'
          data-carousel-toggle
          aria-label='স্লাইড থামান'
          className='grid size-8 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-accent hover:text-link'
        >
          <svg
            className='icon size-3.5 group-data-paused/hero:hidden'
            aria-hidden='true'
          >
            <use href='#i-pause' />
          </svg>
          <svg
            className='icon size-3.5 hidden group-data-paused/hero:block'
            aria-hidden='true'
          >
            <use href='#i-play' />
          </svg>
        </button>
      </div>
    </section>
  )
}
