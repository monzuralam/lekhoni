import Link from 'next/link'
import Carousel from '../Carousel'
import { TONES } from '../home-kit/acf'
import { HomePicture, Icon, SmartLink } from '../home-kit/ui'
import { getHero } from './data'

// COMPONENT: EcomHero (design/home-ecommerce.html). Department menu (large
// screens), slider, and up to two side banners (extra-large screens).
// Hidden without slides.

export default async function EcomHero () {
  const { slides, sideBanners, menu } = await getHero()
  if (!slides.length) return null
  const departments = menu?.departments ?? []

  const columns = [
    departments.length ? 'lg:grid-cols-[15rem_minmax(0,1fr)]' : '',
    departments.length && sideBanners.length ? 'xl:grid-cols-[15rem_minmax(0,1fr)_15rem]' : '',
    !departments.length && sideBanners.length ? 'xl:grid-cols-[minmax(0,1fr)_15rem]' : ''
  ].join(' ')

  return (
    <section aria-label='প্রধান অফার' className='mx-auto mt-4 w-full max-w-site px-4 sm:px-6'>
      <div className={`grid gap-4 ${columns}`}>
        {menu && departments.length > 0 && (
          <nav aria-label={menu.title} className='overflow-hidden rounded-card border border-line bg-surface max-lg:hidden'>
            <p className='flex items-center gap-2 border-b border-line bg-accent px-4 py-3 text-sm font-semibold text-accent-ink'>
              <Icon name='menu' />
              {menu.title}
            </p>
            <ul className='py-1'>
              {departments.slice(0, 10).map(department => (
                <li key={department.id}>
                  <Link
                    href={department.href}
                    className='group/dept flex items-center gap-3 px-4 py-2.5 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link'
                  >
                    <Icon name={department.icon || 'grid'} className='size-4.5 text-muted transition group-hover/dept:text-link' />
                    <span className='flex-1'>{department.name}</span>
                    <Icon name='chevron-right' className='size-4 text-muted opacity-0 transition group-hover/dept:opacity-100' />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <Carousel autoplay={6000} loop aria-label='অফার স্লাইডার' className='group/hero relative min-w-0'>
          <div className='relative h-full overflow-hidden rounded-card border border-line'>
            <ul data-carousel-track tabIndex={0} className='scrollbar-none flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth'>
              {slides.map((slide, index) => {
                const Heading = index === 0 ? 'h1' : 'h2'
                return (
                  <li key={index} className='w-full shrink-0 snap-center'>
                    <div className={`grid h-full items-center gap-4 px-6 py-8 sm:px-10 md:grid-cols-[1.1fr_1fr] ${TONES[slide.tone].bg}`}>
                      <div className='text-center md:text-left'>
                        {slide.eyebrow && (
                          <p className='inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-xs font-bold text-link'>
                            <Icon name='zap' className='size-3.5' />
                            {slide.eyebrow}
                          </p>
                        )}
                        <Heading className='mt-3 text-3xl font-bold text-ink sm:text-4xl sm:leading-[1.25]'>{slide.title}</Heading>
                        {slide.text && <p className='mt-3 text-ink-2'>{slide.text}</p>}
                        <SmartLink
                          link={slide.link}
                          className='mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
                        >
                          {slide.link.label}
                          <Icon name='arrow-right' />
                        </SmartLink>
                      </div>
                      <HomePicture
                        image={slide.image}
                        alt=''
                        sizes='(min-width: 1024px) 420px, 90vw'
                        priority={index === 0}
                        className='mx-auto aspect-[9/7] w-full max-w-sm object-contain md:max-w-none'
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            {slides.length > 1 && <div data-carousel-dots className='absolute inset-x-0 bottom-3 flex items-center justify-center gap-2' />}
          </div>
        </Carousel>

        {sideBanners.length > 0 && (
          <div className='grid gap-4 max-xl:hidden'>
            {sideBanners.map((banner, index) => {
              const body = (
                <>
                  <span>
                    {banner.eyebrow && <span className={`text-xs font-bold ${TONES[banner.tone].text}`}>{banner.eyebrow}</span>}
                    <span className='mt-1 block text-lg font-bold leading-snug text-ink'>{banner.title}</span>
                  </span>
                  {banner.image && (
                    <HomePicture
                      image={banner.image}
                      alt=''
                      sizes='112px'
                      className='ml-auto size-28 rounded-xl object-cover transition duration-500 group-hover/banner:scale-105'
                    />
                  )}
                </>
              )
              const className = `group/banner relative flex flex-col justify-between gap-3 overflow-hidden rounded-card border border-line p-5 ${TONES[banner.tone].bg}`
              return banner.link ? (
                <SmartLink key={index} link={banner.link} className={className}>{body}</SmartLink>
              ) : (
                <div key={index} className={className}>{body}</div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
