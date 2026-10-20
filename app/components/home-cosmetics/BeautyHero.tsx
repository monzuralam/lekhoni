import Carousel from '../Carousel'
import { HomePicture, Icon, SmartLink, Stars } from '../home-kit/ui'
import { getBeautyHero } from './data'

// COMPONENT: BeautyHero (design/home-cosmetics.html): full-width editorial
// slider, the image in an arch, an optional badge and the store's rating.
// Hidden without slides.

const BUTTON = 'inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
const BUTTON_OUTLINE = 'inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95'

export default async function BeautyHero () {
  const hero = await getBeautyHero()
  if (!hero) return null
  const many = hero.slides.length > 1

  return (
    <Carousel autoplay={many ? 7000 : 0} loop={many} aria-label='প্রধান অফার' className='group/hero relative bg-surface-2'>
      <ul data-carousel-track tabIndex={0} className='scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth'>
        {hero.slides.map((slide, index) => {
          const Heading = index === 0 ? 'h1' : 'h2'
          return (
            <li key={index} className='w-full shrink-0 snap-center'>
              <div className={`mx-auto grid w-full max-w-site items-center gap-8 px-4 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-14 ${many ? 'pb-16 pt-10' : 'py-10'}`}>
                <div className='text-center md:text-left'>
                  {slide.eyebrow && (
                    <p className='inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-link'>
                      <Icon name='sparkles' />
                      {slide.eyebrow}
                    </p>
                  )}
                  <Heading className='mt-4 text-4xl leading-[1.3] text-ink sm:text-6xl sm:leading-[1.2]'>{slide.title}</Heading>
                  {slide.text && <p className='mx-auto mt-5 max-w-lg text-lg text-ink-2 md:mx-0'>{slide.text}</p>}
                  <div className='mt-7 flex flex-wrap justify-center gap-3 md:justify-start'>
                    <SmartLink link={slide.primary} className={BUTTON}>
                      {slide.primary.label}
                      <Icon name='arrow-right' />
                    </SmartLink>
                    {slide.secondary && <SmartLink link={slide.secondary} className={BUTTON_OUTLINE}>{slide.secondary.label}</SmartLink>}
                  </div>
                  {hero.rating && (
                    <p className='mt-7 flex items-center justify-center gap-2 text-sm text-ink-2 md:justify-start'>
                      <Stars rating={hero.rating.average} />
                      <strong className='text-ink'>{hero.rating.average.toLocaleString('bn-BD', { maximumFractionDigits: 1 })}</strong>
                      · {hero.rating.text}
                    </p>
                  )}
                </div>
                <div className='relative mx-auto w-full max-w-[17rem] sm:max-w-sm md:max-w-md'>
                  <HomePicture
                    image={slide.image}
                    sizes='(min-width: 768px) 448px, 272px'
                    priority={index === 0}
                    className='aspect-[4/5] w-full rounded-b-card rounded-t-full object-cover shadow-lift'
                  />
                  {hero.badge && (
                    <p className='absolute -left-3 bottom-10 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-lift sm:-left-8'>
                      <Icon name='shield-check' className='size-4.5 text-success' />
                      {hero.badge}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {many && (
        <div className='absolute inset-x-0 bottom-4 flex items-center justify-center gap-4'>
          <div data-carousel-dots className='flex items-center gap-2' />
          <button type='button' data-carousel-toggle aria-label='স্লাইড থামান' className='grid size-8 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-accent hover:text-link'>
            <Icon name='pause' className='size-3.5 group-data-paused/hero:hidden' />
            <Icon name='play' className='hidden size-3.5 group-data-paused/hero:block' />
          </button>
        </div>
      )}
    </Carousel>
  )
}
