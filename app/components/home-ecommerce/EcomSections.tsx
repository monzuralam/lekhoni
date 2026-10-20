import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import { formatPrice } from '@/lib/products'
import Carousel from '../Carousel'
import Countdown from '../Countdown'
import ProductCard from '../ProductCard'
import ProductsTabs from '../home/products-tabs'
import SubscribeForm from '../home/content-subscribe-form'
import RecentlyViewed from '../product/RecentlyViewed'
import { TONES, spokenDate } from '../home-kit/acf'
import { CarouselNav, HomePicture, Icon, SectionHead, SmartLink, Stars } from '../home-kit/ui'
import {
  getBrandGrid,
  getCategoryRows,
  getDeals,
  getDepartmentGrid,
  getFooterSections,
  getProductLists,
  getPromoBanners,
  getServices,
  getTabs,
  getWideBanner
} from './data'

// Sections of the "Home – E-commerce" template (design/home-ecommerce.html),
// in page order. Each renders nothing when switched off or empty.

const WRAP = 'mx-auto w-full max-w-site px-4 sm:px-6'

// Department tile colours, cycled
const DEPT_TONES = ['bg-accent/10 text-link', 'bg-sale/10 text-sale', 'bg-success/10 text-success', 'bg-star/15 text-ink']

export async function ServiceStrip () {
  const items = await getServices()
  if (!items) return null
  return (
    <section aria-labelledby='ec-service-title' className={`${WRAP} mt-6`}>
      <h2 id='ec-service-title' className='sr-only'>আমাদের সেবা</h2>
      <ul className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {items.map(item => (
          <li key={item.title} className='flex items-center gap-3 rounded-card border border-line bg-surface p-4'>
            <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-link'>
              <Icon name={item.icon} className='size-5' />
            </span>
            <span>
              <span className='block text-sm font-semibold text-ink'>{item.title}</span>
              {item.text && <span className='block text-xs text-ink-2'>{item.text}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function DepartmentGrid () {
  const grid = await getDepartmentGrid()
  if (!grid) return null
  return (
    <section aria-labelledby='ec-dept-title' className={`${WRAP} mt-14`}>
      <SectionHead id='ec-dept-title' title={grid.title} link={{ href: '/shop', label: 'সব ক্যাটাগরি', external: false }} />
      <ul className='grid grid-cols-4 gap-3 sm:gap-4 lg:grid-cols-8'>
        {grid.departments.slice(0, 16).map((department, index) => (
          <li key={department.id}>
            <Link
              href={department.href}
              className='group/dept flex h-full flex-col items-center gap-2 rounded-card border border-line bg-surface px-2 py-4 text-center transition hover:-translate-y-1 hover:border-accent hover:shadow-lift'
            >
              <span className={`grid size-12 place-items-center rounded-full transition group-hover/dept:scale-110 sm:size-14 ${DEPT_TONES[index % DEPT_TONES.length]}`}>
                <Icon name={department.icon || 'grid'} className='size-6' />
              </span>
              <span className='text-xs font-semibold leading-snug text-ink sm:text-sm'>{department.name}</span>
              {department.count > 0 && <span className='text-[0.6875rem] text-muted max-sm:hidden'>{bn(department.count)}টি পণ্য</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function DealsSection () {
  const deals = await getDeals()
  if (!deals) return null
  return (
    <Carousel aria-label={deals.title} className='mt-14 border-y border-line bg-surface py-10'>
      <div className={WRAP}>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4'>
          <h2 className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
            <span className='grid size-10 place-items-center rounded-lg bg-sale text-white'>
              <Icon name='zap' className='size-5 fill-current' />
            </span>
            {deals.title}
          </h2>
          {deals.endsAt && <Countdown endsAt={deals.endsAt} label={spokenDate(deals.endsAt, deals.timezone)} />}
          <CarouselNav />
        </div>
        <ul data-carousel-track tabIndex={0} className='scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:px-6 scroll-px-4 sm:scroll-px-6'>
          {deals.products.map(product => (
            <li key={product.databaseId} className='w-[62%] shrink-0 snap-start sm:w-56'>
              <ProductCard product={product} showStock />
            </li>
          ))}
        </ul>
      </div>
    </Carousel>
  )
}

export async function PopularTabs () {
  const section = await getTabs()
  if (!section) return null
  return (
    <ProductsTabs
      idPrefix='ec'
      title={section.title}
      className={`${WRAP} mt-14`}
      tabs={section.tabs.map(tab => ({
        key: tab.key,
        label: tab.label,
        panel: (
          <ul className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {tab.products.map(product => (
              <li key={product.databaseId}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )
      }))}
    />
  )
}

export async function WideBanner () {
  const banner = await getWideBanner()
  if (!banner) return null
  return (
    <section aria-labelledby='ec-wide-title' className={`${WRAP} mt-14`}>
      <div className='relative overflow-hidden rounded-card bg-ink px-6 py-10 text-page sm:px-12'>
        <span aria-hidden='true' className='absolute -right-16 -top-20 size-64 rounded-full bg-accent/40 blur-2xl' />
        <span aria-hidden='true' className='absolute -bottom-24 left-1/3 size-56 rounded-full bg-sale/30 blur-2xl' />
        <div className='relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left'>
          <div>
            {banner.eyebrow && <p className='text-xs font-bold uppercase tracking-widest opacity-75'>{banner.eyebrow}</p>}
            <h2 id='ec-wide-title' className='mt-2 text-3xl font-bold text-page sm:text-4xl'>{banner.title}</h2>
            {banner.text && <p className='mt-2 opacity-80'>{banner.text}</p>}
          </div>
          <div className='flex flex-col items-center gap-3 sm:flex-row'>
            {banner.code && (
              <p className='rounded-lg border-2 border-dashed border-current px-5 py-2.5 font-mono text-xl font-bold tracking-widest'>
                <span className='sr-only'>কুপন কোড: </span>
                {banner.code}
              </p>
            )}
            {banner.link && (
              <SmartLink
                link={banner.link}
                className='inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
              >
                {banner.link.label}
                <Icon name='arrow-right' />
              </SmartLink>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export async function CategoryRows () {
  const rows = await getCategoryRows()
  return rows.map(row => {
    const headingId = `ec-row-${row.key}`
    return (
      <Carousel key={row.key} aria-labelledby={headingId} className={`${WRAP} mt-14`}>
        <SectionHead id={headingId} title={row.title} icon={row.icon || 'grid'} link={row.link}>
          <CarouselNav className='ml-auto flex shrink-0 items-center gap-2 max-sm:hidden' />
        </SectionHead>
        <div className={`grid gap-4 ${row.banner ? 'lg:grid-cols-[16rem_minmax(0,1fr)]' : ''}`}>
          {row.banner && (
            <Link href={row.link.href} className={`group/banner relative flex flex-col overflow-hidden rounded-card border border-line p-6 max-lg:hidden ${TONES[row.banner.tone].bg}`}>
              {row.banner.eyebrow && <span className={`text-xs font-bold uppercase tracking-widest ${TONES[row.banner.tone].text}`}>{row.banner.eyebrow}</span>}
              <span className='mt-2 text-2xl font-bold leading-snug text-ink'>{row.banner.title}</span>
              <span className='mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-link'>
                দেখুন
                <Icon name='arrow-right' />
              </span>
              {row.banner.image && (
                <HomePicture image={row.banner.image} alt='' sizes='256px' className='mt-auto w-full rounded-xl object-cover pt-4 transition duration-500 group-hover/banner:scale-105' />
              )}
            </Link>
          )}
          <ul data-carousel-track tabIndex={0} className='scrollbar-none -mx-4 flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 scroll-px-4 sm:scroll-px-6 lg:scroll-px-0'>
            {row.products.map(product => (
              <li key={product.databaseId} className='w-[62%] shrink-0 snap-start sm:w-56'>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      </Carousel>
    )
  })
}

export async function PromoTrio () {
  const banners = await getPromoBanners()
  if (!banners.length) return null
  return (
    <section aria-labelledby='ec-promo-title' className={`${WRAP} mt-14`}>
      <h2 id='ec-promo-title' className='sr-only'>চলতি অফার</h2>
      <div className='grid gap-4 md:grid-cols-3'>
        {banners.map((banner, index) => {
          const body = (
            <>
              <span>
                {banner.eyebrow && <span className={`text-xs font-bold uppercase tracking-widest ${TONES[banner.tone].text}`}>{banner.eyebrow}</span>}
                <span className='mt-1 block text-lg font-bold leading-snug text-ink'>{banner.title}</span>
                {banner.link && (
                  <span className='mt-3 inline-flex items-center gap-1 text-sm font-semibold text-link'>
                    কিনুন
                    <Icon name='arrow-right' />
                  </span>
                )}
              </span>
              {banner.image && (
                <HomePicture image={banner.image} alt='' sizes='112px' className='aspect-square w-full rounded-xl object-cover transition duration-500 group-hover/banner:scale-105' />
              )}
            </>
          )
          const className = `group/banner grid items-center gap-3 overflow-hidden rounded-card border border-line p-5 transition hover:border-accent ${banner.image ? 'grid-cols-[minmax(0,1fr)_7rem]' : ''} ${TONES[banner.tone].bg}`
          return banner.link ? (
            <SmartLink key={index} link={banner.link} className={className}>{body}</SmartLink>
          ) : (
            <div key={index} className={className}>{body}</div>
          )
        })}
      </div>
    </section>
  )
}

export async function ProductLists () {
  const lists = await getProductLists()
  if (!lists) return null
  return (
    <section aria-label='পণ্যের তালিকা' className={`${WRAP} mt-14`}>
      <div className='grid gap-4 md:grid-cols-3'>
        {lists.map(list => (
          <div key={list.key} className='rounded-card border border-line bg-surface p-4'>
            <h2 className='mb-2 flex items-center gap-2 px-2 text-lg font-bold text-ink'>
              <Icon name={list.icon} className='size-5 text-link' />
              {list.title}
            </h2>
            <ul className='divide-y divide-line'>
              {list.products.map(product => (
                <li key={product.databaseId}>
                  <Link href={product.uri} className='group/mini flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface-2'>
                    {product.image?.sourceUrl && (
                      <Image src={product.image.sourceUrl} alt='' width={64} height={64} sizes='64px' className='size-16 shrink-0 rounded-lg border border-line object-cover' />
                    )}
                    <span className='min-w-0'>
                      <span className='line-clamp-1 text-sm font-semibold text-ink transition group-hover/mini:text-link'>{product.name}</span>
                      {(product.reviewCount ?? 0) > 0 && (
                        <span className='mt-0.5 flex items-center gap-1'>
                          <Stars rating={product.averageRating ?? 0} className='size-3' />
                          <span className='text-xs text-muted'>({bn(product.reviewCount ?? 0)})</span>
                        </span>
                      )}
                      <span className='mt-0.5 flex items-baseline gap-2'>
                        <span className={`text-sm font-bold ${product.onSale ? 'text-sale' : 'text-ink'}`}>{formatPrice(product.price)}</span>
                        {product.onSale && product.regularPrice && product.regularPrice !== product.price && (
                          <del className='text-xs text-muted'>{formatPrice(product.regularPrice)}</del>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

const BRAND_STYLES = ['', 'italic', 'tracking-wide', 'font-serif', 'italic', 'tracking-wide']

export async function BrandGrid () {
  const grid = await getBrandGrid()
  if (!grid) return null
  return (
    <section aria-labelledby='ec-brands-title' className={`${WRAP} mt-14`}>
      <SectionHead id='ec-brands-title' title={grid.title} />
      <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        {grid.brands.map((brand, index) => {
          const body = brand.logo ? (
            <Image src={brand.logo.sourceUrl} alt={brand.name} width={brand.logo.width} height={brand.logo.height} sizes='160px' unoptimized={/\.svg(\?|$)/i.test(brand.logo.sourceUrl)} className='max-h-10 w-auto object-contain' />
          ) : brand.name
          const className = `grid h-20 place-items-center rounded-card border border-line bg-surface px-4 text-xl font-bold text-muted transition hover:border-accent hover:text-link ${BRAND_STYLES[index % BRAND_STYLES.length]}`
          return (
            <li key={`${brand.name}-${index}`}>
              {brand.link ? <SmartLink link={{ href: brand.link, label: brand.name, external: /^https?:\/\//.test(brand.link) }} className={className}>{body}</SmartLink> : <div className={className}>{body}</div>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export async function EcomFooterSections () {
  const { recentlyViewed, subscribe } = await getFooterSections()
  return (
    <>
      {recentlyViewed && <RecentlyViewed className={`${WRAP} mt-14`} />}
      {subscribe && (
        <section aria-labelledby='ec-news-title' className={`${WRAP} mt-14 print:hidden`}>
          <div className='grid items-center gap-6 overflow-hidden rounded-card border border-line bg-accent/10 px-6 py-10 sm:px-10 md:grid-cols-[1fr_auto]'>
            <div>
              <h2 id='ec-news-title' className='flex items-center gap-3 text-2xl font-bold text-ink sm:text-3xl'>
                <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink'>
                  <Icon name='mail' className='size-5' />
                </span>
                {subscribe.title}
              </h2>
              <p className='mt-3 text-ink-2'>{subscribe.text}</p>
            </div>
            <div className='w-full md:w-[26rem] [&_form]:mt-0'>
              <SubscribeForm id='ec-subscribe' source='home' successMessage={subscribe.successMessage} />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
