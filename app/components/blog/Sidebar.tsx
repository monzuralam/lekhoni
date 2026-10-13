import Image from 'next/image'
import Link from 'next/link'
import { getThemeSettings, type SocialNetwork } from '@/lib/theme-settings'
import { getPopularPosts, getTags, type TermLink } from './data'
import { formatDate, isoDay, linkTo } from './format'

// COMPONENT: Sidebar (design/blog.html): AboutWidget, PopularPostsWidget,
// TagCloudWidget and SocialTilesWidget. The design's AdSlot is marked optional
// and there's no ad source, so it's left out.

const card = 'rounded-card border border-line bg-surface shadow-soft p-6'

// Shorter tile labels where the full name doesn't fit
const TILE_LABELS: Partial<Record<SocialNetwork, string>> = { instagram: 'ইনস্টা', rss: 'RSS' }

function AboutWidget ({ title, description }: { title: string; description: string }) {
  return (
    <section className={`${card} text-center`}>
      <span
        aria-hidden='true'
        className='mx-auto grid size-20 place-items-center rounded-full border-4 border-surface-2 bg-accent/10 font-serif text-3xl font-bold text-link'
      >
        {title.charAt(0) || 'ল'}
      </span>
      <h2 className='mt-3 text-lg text-ink'>{title ? `${title}-তে স্বাগতম` : 'স্বাগতম'}</h2>
      {description && <p className='mt-2 text-[0.95rem] leading-relaxed text-ink-2'>{description}</p>}
      <Link
        href='/about'
        className='mt-3 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10'
      >
        আরো জানুন
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-arrow-right' />
        </svg>
      </Link>
    </section>
  )
}

async function PopularPostsWidget () {
  const posts = await getPopularPosts()
  if (!posts.length) return null
  return (
    <section className={card}>
      <h2 className='mb-4 text-lg text-ink'>জনপ্রিয় লেখা</h2>
      <ul className='space-y-4'>
        {posts.map(post => (
          <li key={post.uri}>
            <article className='group/post flex items-center gap-3'>
              <Link href={linkTo(post.uri)} tabIndex={-1} aria-hidden='true' className='block size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2'>
                {post.image && (
                  <Image
                    src={post.image.sourceUrl}
                    alt=''
                    width={128}
                    height={128}
                    sizes='64px'
                    unoptimized={/\.svg(\?|$)/i.test(post.image.sourceUrl)}
                    className='size-full object-cover'
                  />
                )}
              </Link>
              <div className='min-w-0'>
                <h3 className='line-clamp-2 font-serif text-[0.95rem] font-semibold leading-snug text-ink'>
                  <Link href={linkTo(post.uri)} className='transition hover:text-link'>
                    {post.title}
                  </Link>
                </h3>
                <time dateTime={isoDay(post.dateGmt)} className='text-xs text-muted'>
                  {formatDate(post.dateGmt)}
                </time>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function TagList ({ tags, linkTerms, prefix = '' }: { tags: TermLink[]; linkTerms: boolean; prefix?: string }) {
  const className = 'inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2'
  return tags.map(tag => (
    <li key={tag.uri}>
      {linkTerms ? (
        <Link href={linkTo(tag.uri)} className={`${className} transition hover:bg-accent/10 hover:text-link`}>
          {prefix}{tag.name}
        </Link>
      ) : (
        <span className={className}>{prefix}{tag.name}</span>
      )}
    </li>
  ))
}

async function TagCloudWidget ({ linkTerms }: { linkTerms: boolean }) {
  const tags = await getTags()
  if (!tags.length) return null
  return (
    <section className={card}>
      <h2 className='mb-4 text-lg text-ink'>বিষয়</h2>
      <ul className='flex flex-wrap gap-2'>
        <TagList tags={tags} linkTerms={linkTerms} />
      </ul>
    </section>
  )
}

// Theme Settings → Social Profiles; hidden when none are set
async function SocialTilesWidget () {
  const { social } = await getThemeSettings()
  if (!social.length) return null
  const columns = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'][Math.min(social.length, 4) - 1]
  return (
    <section aria-label='সামাজিক যোগাযোগ' className={`grid gap-2 ${columns}`}>
      {social.map(item => (
        <a
          key={`${item.network}-${item.url}`}
          href={item.url}
          target='_blank'
          rel='noopener noreferrer me'
          className='flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-surface text-ink-2 transition hover:-translate-y-0.5 hover:border-accent hover:text-link'
        >
          <svg className='icon size-5' aria-hidden='true'>
            <use href={`#i-${item.network}`} />
          </svg>
          <span className='text-xs font-medium'>{TILE_LABELS[item.network] ?? item.label}</span>
        </a>
      ))}
    </section>
  )
}

export default function Sidebar ({ siteTitle, siteDescription, linkTerms }: { siteTitle: string; siteDescription: string; linkTerms: boolean }) {
  return (
    <aside aria-label='সাইডবার' className='space-y-6 self-start group-data-reading/body:hidden print:hidden lg:sticky lg:top-32'>
      <AboutWidget title={siteTitle} description={siteDescription} />
      <PopularPostsWidget />
      <TagCloudWidget linkTerms={linkTerms} />
      <SocialTilesWidget />
    </aside>
  )
}
