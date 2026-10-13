import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { getThemeSettings, type TopicSource } from '@/lib/theme-settings'
import Logo from './header/Logo'
import { getMenu, type MenuItem } from './header/menu'
import SocialLinks from './layout/SocialLinks'
import { TagList } from './blog/Sidebar'
import { getBlogSettings } from './blog/data'
import { linkTo } from './blog/format'

// Site footer (design: footer of every page). Columns, texts, social icons,
// payment badges and copyright come from Theme Settings → Footer
// (lib/theme-settings.ts); the links from Appearance → Menus → "Footer menu".
// A column with nothing to show is left out and the rest close up.

type Term = { name: string; uri: string }

async function getRecentPosts (count: number): Promise<{ title: string; uri: string }[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const data = await wpQuery(
    'query FooterPosts($first: Int) { posts(first: $first) { nodes { title uri } } }',
    { first: count }
  ).catch(() => null)
  return data?.posts?.nodes ?? []
}

async function getTopics (source: TopicSource, count: number): Promise<Term[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts', 'products')
  const field = source === 'tags' ? 'tags' : source === 'product_categories' ? 'productCategories' : 'categories'
  const data = await wpQuery(
    `query FooterTopics($first: Int) {
      terms: ${field}(first: $first, where: { hideEmpty: true, orderby: COUNT, order: DESC }) {
        nodes { name uri }
      }
    }`,
    { first: count }
  ).catch(() => null)
  return (data?.terms?.nodes ?? []).filter((term: Term) => term.uri && term.name !== 'Uncategorized')
}

// Footer menus are one level: nested items are listed after their parent
const flatten = (items: MenuItem[]): MenuItem[] => items.flatMap(item => [item, ...flatten(item.children)])

const HEADING = 'mb-4 text-lg text-ink'

export default async function Footer () {
  const settings = await getThemeSettings()
  const { footer } = settings

  const [posts, topics, links, blog] = await Promise.all([
    footer.recentPosts ? getRecentPosts(footer.recentPosts.count) : [],
    footer.topics ? getTopics(footer.topics.source, footer.topics.count) : [],
    footer.links ? getMenu('FOOTER').then(flatten) : [],
    getBlogSettings()
  ])
  // Post category/tag archives only exist under a blog (Settings → Reading)
  const linkTopics = footer.topics?.source === 'product_categories' || Boolean(blog.postsPage)

  const columns = [
    footer.about && (
      <div key='about'>
        <h2 className={HEADING}>{footer.about.title}</h2>
        <p className='text-[0.95rem] leading-relaxed text-ink-2'>{footer.about.text}</p>
        {footer.about.showSocial && <SocialLinks links={settings.social} variant='footer' />}
      </div>
    ),
    footer.recentPosts && posts.length > 0 && (
      <div key='posts'>
        <h2 className={HEADING}>{footer.recentPosts.title}</h2>
        <ul className='space-y-2.5 text-[0.95rem] leading-snug'>
          {posts.map(post => (
            <li key={post.uri}>
              <Link href={linkTo(post.uri)} className='line-clamp-2 text-ink-2 transition hover:text-link'>
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ),
    footer.topics && topics.length > 0 && (
      <div key='topics'>
        <h2 className={HEADING}>{footer.topics.title}</h2>
        <ul className='flex flex-wrap gap-2'>
          <TagList tags={topics} linkTerms={linkTopics} />
        </ul>
      </div>
    ),
    footer.links && links.length > 0 && (
      <nav key='links' aria-label={footer.links.title}>
        <h2 className={HEADING}>{footer.links.title}</h2>
        <ul className='space-y-2 text-[0.95rem]'>
          {links.filter(item => item.href).map(item => (
            <li key={item.id}>
              {item.external ? (
                <a
                  href={item.href!}
                  target={item.target ?? undefined}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className='text-ink-2 transition hover:text-link'
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href!} target={item.target ?? undefined} className='text-ink-2 transition hover:text-link'>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    )
  ].filter(Boolean)

  // The design's four-column grid, narrowed when columns are switched off
  const grid = columns.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : columns.length === 3 ? 'sm:grid-cols-3' : columns.length === 2 ? 'sm:grid-cols-2' : ''

  return (
    <footer className='mt-16 border-t border-line bg-surface print:hidden'>
      <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
        {columns.length > 0 && (
          <div className={`grid gap-10 py-12 group-data-reading/body:hidden ${grid}`}>{columns}</div>
        )}
        <div
          className={`flex flex-col items-center gap-4 py-8 text-center${columns.length ? ' border-t border-line group-data-reading/body:border-t-0' : ''}`}
        >
          <Logo settings={settings} variant='footer' />
          {footer.paymentBadges.length > 0 && (
            <ul aria-label='পেমেন্ট পদ্ধতি' className='flex flex-wrap justify-center gap-2'>
              {footer.paymentBadges.map((badge, index) => (
                <li
                  key={`${index}-${badge}`}
                  className='rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2'
                >
                  {badge}
                </li>
              ))}
            </ul>
          )}
          <p className='text-sm text-muted'>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
