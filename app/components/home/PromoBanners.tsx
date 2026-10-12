import Image from 'next/image'
import Link from 'next/link'
import { contentLink, getHomeContent } from './content-data'

// COMPONENT: PromoBanners (design/home-shop.html). Offer banners from the
// "Home Content" ACF group (Promo Banners). Hidden when there are no banners.

// Full class names so Tailwind picks them up
const BACKGROUNDS: Record<string, string> = {
  accent: 'bg-accent/10',
  sale: 'bg-sale/10'
}

const BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 mt-4'

export default async function PromoBanners () {
  const content = await getHomeContent()
  const section = content?.promoSection
  const banners = (section?.banners ?? []).filter(banner => banner.title)
  if (!banners.length) return null

  return (
    <section aria-labelledby='promo-title' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16'>
      <h2 id='promo-title' className='sr-only'>
        {section?.title || 'চলতি অফার'}
      </h2>
      <div className='grid gap-6 lg:grid-cols-2'>
        {banners.map((banner, index) => {
          const style = Array.isArray(banner.style) ? banner.style[0] : banner.style
          const link = contentLink(banner.link)
          const image = banner.image?.node
          const label = (
            <>
              {link?.label || 'অফার দেখুন'}
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </>
          )
          return (
            <article
              key={index}
              className={`relative grid items-center gap-4 overflow-hidden rounded-card border border-line p-6 sm:p-8 ${image ? 'grid-cols-[minmax(0,3fr)_minmax(0,2fr)]' : ''} ${BACKGROUNDS[style ?? ''] ?? BACKGROUNDS.accent}`}
            >
              <div>
                {banner.eyebrow && (
                  <p className='text-xs font-semibold uppercase tracking-widest text-link'>{banner.eyebrow}</p>
                )}
                <h3 className='mt-2 text-2xl text-ink sm:text-[1.75rem]'>{banner.title}</h3>
                {banner.text && <p className='mt-2 text-[0.95rem] text-ink-2'>{banner.text}</p>}
                {link && (link.external ? (
                  <a href={link.href} target={link.target} rel={link.rel} className={BUTTON_CLASS}>
                    {label}
                  </a>
                ) : (
                  <Link href={link.href} target={link.target} rel={link.rel} className={BUTTON_CLASS}>
                    {label}
                  </Link>
                ))}
              </div>
              {image && (
                <Image
                  src={image.sourceUrl}
                  alt='' // decorative: the banner's title says what it is
                  width={image.mediaDetails?.width || 800}
                  height={image.mediaDetails?.height || 800}
                  sizes='(min-width: 1024px) 240px, 40vw'
                  unoptimized={/\.svg(\?|$)/i.test(image.sourceUrl)}
                  className='aspect-square w-full rounded-2xl object-cover shadow-soft'
                />
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
