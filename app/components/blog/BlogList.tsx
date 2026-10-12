import Link from 'next/link'
import { bn } from '@/lib/bn'
import PageHeader from '../layout/PageHeader'
import type { Crumb } from '../layout/Breadcrumbs'
import Pagination from '../shop/Pagination'
import PostCard from './PostCard'
import Sidebar from './Sidebar'
import { getCategories, type BlogSettings, type CardPost } from './data'
import { linkTo } from './format'

// Port of design/blog.html: PageHeader, FilterBar (category chips as links),
// PostCard list, numbered Pagination and the Sidebar. The design's client-side
// sort <select> is left out (the list is paged on the server, newest first),
// and so is the SubscribeBand (no newsletter provider to send signups to).

type BlogListProps = {
  settings: BlogSettings & { postsPage: NonNullable<BlogSettings['postsPage']> }
  title: string
  description?: string | null
  crumbs: Crumb[]
  baseUri: string // archive URI, e.g. /blog/ or /category/news/
  activeUri: string | null // highlighted chip (null for tag archives)
  posts: CardPost[]
  total: number
  page: number
  totalPages: number
}

const CHIP =
  'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:border-accent hover:text-link aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink'

// /blog/ + 1 -> /blog, /blog/ + 3 -> /blog/page/3
export const pageHref = (baseUri: string, page: number) =>
  page > 1 ? `${baseUri}page/${page}` : linkTo(baseUri)

async function FilterBar ({ postsUri, activeUri, total }: { postsUri: string; activeUri: string | null; total: number }) {
  const categories = await getCategories()
  const chips = [{ name: 'সব', uri: postsUri }, ...categories]
  return (
    <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
      <ul aria-label='বিষয় অনুযায়ী বাছাই' className='flex flex-wrap gap-2'>
        {chips.map(chip => (
          <li key={chip.uri}>
            <Link href={linkTo(chip.uri)} aria-current={chip.uri === activeUri ? 'page' : undefined} className={CHIP}>
              {chip.name}
            </Link>
          </li>
        ))}
      </ul>
      <p className='text-sm text-muted'>
        <span className='font-semibold text-ink'>{bn(total)}</span>টি লেখা
      </p>
    </div>
  )
}

export default function BlogList ({ settings, title, description, crumbs, baseUri, activeUri, posts, total, page, totalPages }: BlogListProps) {
  return (
    <>
      <PageHeader title={title} breadcrumbs={crumbs} description={description || undefined} />
      <div className='mx-auto mt-10 grid w-full max-w-site gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]'>
        <section aria-label='লেখার তালিকা'>
          <FilterBar postsUri={settings.postsPage.uri} activeUri={activeUri} total={total} />
          {posts.length ? (
            <div className='space-y-6'>
              {posts.map((post, index) => (
                <PostCard key={post.databaseId} post={post} priority={page === 1 && index === 0} />
              ))}
            </div>
          ) : (
            <p className='rounded-card border border-dashed border-line p-10 text-center text-ink-2'>
              এই বিষয়ে এখনো কোনো লেখা নেই।
            </p>
          )}
          <Pagination page={page} totalPages={totalPages} href={n => pageHref(baseUri, n)} />
        </section>
        <Sidebar siteTitle={settings.siteTitle} siteDescription={settings.siteDescription} linkTerms />
      </div>
    </>
  )
}
