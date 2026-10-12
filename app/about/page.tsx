import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wpQuery } from '@/lib/wp'
import { plainText } from '@/lib/products'
import Breadcrumbs from '../components/layout/Breadcrumbs'

// About page from WordPress: the page with slug "about" (template "About").
// Mission text is the page content; every other section comes from the
// "About Page" ACF group (wp-content/themes/lekhoni/inc/acf-about.php).
// Port of design/about.html. Sections without content are left out.

type AcfImage = {
  node: {
    sourceUrl: string
    altText: string | null
    mediaDetails: { width: number | null; height: number | null } | null
  }
} | null
type AcfLink = { url: string | null; title: string | null; target: string | null } | null

type AboutPage = {
  title: string
  content: string | null
  featuredImage: AcfImage
  aboutPage: {
    hero: {
      eyebrow: string | null
      title: string | null
      highlight: string | null
      description: string | null
      primaryButton: AcfLink
      secondaryButton: AcfLink
      image: AcfImage
    } | null
    valuesSection: {
      title: string | null
      items: { icon: string[] | string | null; title: string | null; description: string | null }[] | null
    } | null
    stats: { value: string | null; label: string | null }[] | null
    teamSection: {
      title: string | null
      members: {
        name: string | null
        role: string | null
        bio: string | null
        link: string | null
        photo: AcfImage
      }[] | null
    } | null
    cta: { title: string | null; text: string | null; button: AcfLink } | null
  } | null
}

const IMAGE_FIELDS = `
  node {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
  }
`
const LINK_FIELDS = 'url title target'

async function getAboutPage () {
  const data = await wpQuery(`
    {
      page(id: "about", idType: URI) {
        title
        content
        featuredImage { ${IMAGE_FIELDS} }
        aboutPage {
          hero {
            eyebrow
            title
            highlight
            description
            primaryButton { ${LINK_FIELDS} }
            secondaryButton { ${LINK_FIELDS} }
            image { ${IMAGE_FIELDS} }
          }
          valuesSection {
            title
            items {
              icon
              title
              description
            }
          }
          stats {
            value
            label
          }
          teamSection {
            title
            members {
              name
              role
              bio
              link
              photo { ${IMAGE_FIELDS} }
            }
          }
          cta {
            title
            text
            button { ${LINK_FIELDS} }
          }
        }
      }
    }
  `)
  return (data?.page ?? null) as AboutPage | null
}

// ACF links may be absolute WordPress URLs; same-site ones become storefront paths
function linkProps (link: AcfLink) {
  if (!link?.url) return null
  let href = link.url
  try {
    const wp = new URL(process.env.WP_SITE_URL ?? process.env.WP_GRAPHQL_URL ?? '')
    const url = new URL(link.url, wp)
    if (url.origin === wp.origin) href = `${url.pathname.replace(/\/+$/, '') || '/'}${url.search}${url.hash}`
  } catch {}
  const external = /^https?:\/\//.test(href)
  return {
    href,
    label: link.title || href,
    target: link.target || undefined,
    rel: link.target === '_blank' ? 'noopener noreferrer' : undefined,
    external
  }
}

function SmartLink ({ link, className, children }: {
  link: NonNullable<ReturnType<typeof linkProps>>
  className: string
  children: ReactNode
}) {
  return link.external ? (
    <a href={link.href} target={link.target} rel={link.rel} className={className}>
      {children}
    </a>
  ) : (
    <Link href={link.href} target={link.target} rel={link.rel} className={className}>
      {children}
    </Link>
  )
}

// SVGs can't go through Next's image optimizer, so they are served as-is
function WpImage ({ image, fallback, className, sizes, priority }: {
  image: NonNullable<AcfImage>['node']
  fallback: { width: number; height: number; alt: string }
  className: string
  sizes: string
  priority?: boolean
}) {
  return (
    <Image
      src={image.sourceUrl}
      alt={image.altText || fallback.alt}
      width={image.mediaDetails?.width || fallback.width}
      height={image.mediaDetails?.height || fallback.height}
      sizes={sizes}
      priority={priority}
      unoptimized={/\.svg(\?|$)/i.test(image.sourceUrl)}
      className={className}
    />
  )
}

export async function generateMetadata (): Promise<Metadata> {
  const page = await getAboutPage()
  if (!page) return { title: 'পাতা পাওয়া যায়নি' }
  const description =
    page.aboutPage?.hero?.description || plainText(page.content).slice(0, 160) || undefined
  const image = page.aboutPage?.hero?.image?.node?.sourceUrl ?? page.featuredImage?.node?.sourceUrl
  return {
    title: page.title,
    description,
    openGraph: { title: page.title, description, images: image ? [image] : undefined }
  }
}

export default async function AboutPage () {
  const page = await getAboutPage()
  if (!page) notFound()

  const { hero, valuesSection, stats, teamSection, cta } = page.aboutPage ?? {}
  const heroImage = hero?.image?.node ?? page.featuredImage?.node
  const primary = linkProps(hero?.primaryButton ?? null)
  const secondary = linkProps(hero?.secondaryButton ?? null)
  const values = (valuesSection?.items ?? []).filter(item => item.title)
  const numbers = (stats ?? []).filter(stat => stat.value && stat.label)
  const members = (teamSection?.members ?? []).filter(member => member.name)
  const ctaButton = linkProps(cta?.button ?? null)

  return (
    <>
      <header className='mx-auto w-full max-w-site px-4 sm:px-6 grid items-center gap-10 pt-10 sm:pt-14 lg:grid-cols-2'>
        <div>
          <Breadcrumbs items={[{ label: page.title }]} />
          {hero?.eyebrow && (
            <p className='text-xs font-semibold uppercase tracking-widest text-link mt-6'>{hero.eyebrow}</p>
          )}
          <h1 className='mt-3 text-4xl text-ink sm:text-5xl sm:leading-[1.3]'>
            {hero?.title || page.title}
            {hero?.highlight && (
              <>
                {' '}
                <span className='text-link'>{hero.highlight}</span>
              </>
            )}
          </h1>
          {hero?.description && (
            <p className='mt-5 text-lg leading-relaxed text-ink-2'>{hero.description}</p>
          )}
          {(primary || secondary) && (
            <div className='mt-6 flex flex-wrap gap-3'>
              {primary && (
                <SmartLink
                  link={primary}
                  className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
                >
                  {primary.label}
                </SmartLink>
              )}
              {secondary && (
                <SmartLink
                  link={secondary}
                  className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95'
                >
                  {secondary.label}
                </SmartLink>
              )}
            </div>
          )}
        </div>
        {heroImage && (
          <WpImage
            image={heroImage}
            fallback={{ width: 1200, height: 675, alt: '' }}
            sizes='(min-width: 1024px) 560px, 100vw'
            priority
            className='aspect-video w-full rounded-card border border-line object-cover shadow-lift'
          />
        )}
      </header>

      {page.content && (
        <section className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16 max-w-3xl'>
          {/* Editor content from WordPress (trusted, written by site admins) */}
          <div className='entry-content prose' dangerouslySetInnerHTML={{ __html: page.content }} />
        </section>
      )}

      {values.length > 0 && (
        <section aria-labelledby='values-title' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16'>
          {valuesSection?.title && (
            <h2 id='values-title' className='text-center text-3xl text-ink'>
              {valuesSection.title}
            </h2>
          )}
          <ul className='mt-8 grid gap-6 md:grid-cols-3'>
            {values.map((item, index) => {
              const icon = (Array.isArray(item.icon) ? item.icon[0] : item.icon) || 'book'
              return (
                <li key={index} className='rounded-card border border-line bg-surface shadow-soft p-6'>
                  <span className='grid size-12 place-items-center rounded-2xl bg-accent/10 text-link'>
                    <svg className='icon size-6' aria-hidden='true'>
                      <use href={`#i-${icon}`} />
                    </svg>
                  </span>
                  <h3 className='mt-4 text-xl text-ink'>{item.title}</h3>
                  {item.description && (
                    <p className='mt-2 text-[0.95rem] leading-relaxed text-ink-2'>{item.description}</p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {numbers.length > 0 && (
        <section aria-label='সংখ্যায় লেখনী' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16'>
          <dl className='grid grid-cols-2 divide-line rounded-card border border-line bg-surface shadow-soft max-lg:[&>*:nth-child(-n+2)]:border-b max-lg:[&>*:nth-child(odd)]:border-r max-lg:[&>*]:border-line lg:grid-cols-4 lg:divide-x'>
            {numbers.map((stat, index) => (
              <div key={index} className='px-4 py-6 text-center'>
                <dd className='font-serif text-4xl font-bold text-link'>{stat.value}</dd>
                <dt className='mt-1 text-sm text-ink-2'>{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {members.length > 0 && (
        <section aria-labelledby='team-title' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16'>
          {teamSection?.title && (
            <h2 id='team-title' className='text-center text-3xl text-ink'>
              {teamSection.title}
            </h2>
          )}
          <ul className='mt-8 grid gap-6 lg:grid-cols-2'>
            {members.map((member, index) => (
              <li
                key={index}
                className='rounded-card border border-line bg-surface shadow-soft flex flex-col items-center gap-3 p-8 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left'
              >
                {member.photo?.node && (
                  <WpImage
                    image={member.photo.node}
                    fallback={{ width: 160, height: 160, alt: `${member.name}-এর ছবি` }}
                    sizes='96px'
                    className='size-24 shrink-0 rounded-full object-cover'
                  />
                )}
                <div>
                  <h3 className='text-xl text-ink'>
                    {member.link ? (
                      <a href={member.link} className='transition hover:text-link'>
                        {member.name}
                      </a>
                    ) : (
                      member.name
                    )}
                  </h3>
                  {member.role && <p className='text-sm font-medium text-link'>{member.role}</p>}
                  {member.bio && (
                    <p className='mt-2 text-[0.95rem] leading-relaxed text-ink-2'>{member.bio}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cta?.title && (
        <section aria-labelledby='about-cta' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16'>
          <div className='rounded-card bg-accent px-6 py-12 text-center text-accent-ink sm:px-12'>
            <h2 id='about-cta' className='text-3xl'>
              {cta.title}
            </h2>
            {cta.text && <p className='mx-auto mt-3 max-w-xl opacity-90'>{cta.text}</p>}
            {ctaButton && (
              <SmartLink
                link={ctaButton}
                className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:scale-105'
              >
                {ctaButton.label}
                <svg className='icon size-4' aria-hidden='true'>
                  <use href='#i-arrow-right' />
                </svg>
              </SmartLink>
            )}
          </div>
        </section>
      )}
    </>
  )
}
