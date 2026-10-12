import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import { SEARCH_TYPE_LABEL, searchSite, searchSuggestions, type SearchType } from '@/lib/search'
import Breadcrumbs from '../components/layout/Breadcrumbs'

// Port of design/search.html: /search?q=…&type=… searches products, product
// categories, posts and pages. The type chips are links, so the page works
// without JavaScript. The header palette links here for "all results".

export const metadata: Metadata = {
  title: 'সাইটে খুঁজুন',
  robots: { index: false }
}

const CHIP =
  'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:border-accent hover:text-link aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink'

const TYPES: SearchType[] = ['product', 'category', 'post', 'page']

const href = (q: string, type?: string) =>
  `/search?q=${encodeURIComponent(q)}${type && type !== 'all' ? `&type=${type}` : ''}`

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? ''

export default function SearchPage ({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div data-search-page>
      <header className='border-b border-line bg-surface-2/60'>
        <div className='mx-auto w-full max-w-site px-4 sm:px-6 py-10 text-center sm:py-14'>
          <div className='flex justify-center'>
            <Breadcrumbs items={[{ label: 'খুঁজুন' }]} />
          </div>
          <h1 className='mt-5 text-3xl text-ink sm:text-[2.5rem]'>সাইটে খুঁজুন</h1>
          <Suspense fallback={<SearchForm query='' />}>
            <SearchFormWithQuery searchParams={searchParams} />
          </Suspense>
          <p className='mt-3 text-sm text-muted'>
            দ্রুত খোঁজার জন্য যেকোনো পাতায় <kbd>Ctrl</kbd> + <kbd>K</kbd> অথবা <kbd>/</kbd> চাপুন।
          </p>
        </div>
      </header>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function SearchForm ({ query }: { query: string }) {
  return (
    <form
      action='/search'
      method='get'
      role='search'
      className='mx-auto mt-6 flex max-w-2xl items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-soft focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20'
    >
      <label htmlFor='search-q' className='sr-only'>
        কী খুঁজছেন
      </label>
      <span className='pl-4 text-muted'>
        <svg className='icon size-5' aria-hidden='true'>
          <use href='#i-search' />
        </svg>
      </span>
      <input
        id='search-q'
        name='q'
        type='search'
        defaultValue={query}
        placeholder='পোস্ট, পেজ বা পণ্য খুঁজুন…'
        autoComplete='off'
        className='h-11 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus:outline-none'
      />
      <button
        type='submit'
        className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 h-11'
      >
        খুঁজুন
      </button>
    </form>
  )
}

async function SearchFormWithQuery ({ searchParams }: { searchParams: SearchParams }) {
  const query = param((await searchParams).q).trim()
  return <SearchForm key={query} query={query} />
}

async function Results ({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = param(params.q).trim()
  const type = TYPES.includes(param(params.type) as SearchType) ? (param(params.type) as SearchType) : 'all'

  if (query.length < 2) {
    const terms = await searchSuggestions().catch(() => [])
    return (
      <section aria-labelledby='popular-terms' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-12 text-center'>
        <span className='mx-auto grid size-16 place-items-center rounded-full bg-accent/10 text-link'>
          <svg className='icon size-7' aria-hidden='true'>
            <use href='#i-search' />
          </svg>
        </span>
        <h2 id='popular-terms' className='mt-4 text-2xl text-ink'>
          {query ? 'আরেকটু লিখুন' : 'জনপ্রিয় খোঁজ'}
        </h2>
        <p className='mt-2 text-ink-2'>
          {query ? 'অন্তত দুটি অক্ষর লিখে খুঁজুন।' : 'উপরের ঘরে লিখুন, অথবা নিচের যেকোনো শব্দে ক্লিক করুন।'}
        </p>
        {terms.length > 0 && (
          <ul className='mt-5 flex flex-wrap justify-center gap-2'>
            {terms.map(term => (
              <li key={term.url}>
                <Link href={href(term.title)} className={CHIP}>
                  <svg className='icon size-3.5' aria-hidden='true'>
                    <use href='#i-search' />
                  </svg>
                  {term.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  let all: Awaited<ReturnType<typeof searchSite>> = []
  let failed = false
  try {
    all = await searchSite(query, 20)
  } catch {
    failed = true
  }
  const shown = type === 'all' ? all : all.filter(result => result.type === type)
  const counts = Object.fromEntries(TYPES.map(t => [t, all.filter(result => result.type === t).length]))

  return (
    <section aria-labelledby='results-title' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10 max-w-4xl'>
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4'>
        <h2 id='results-title' className='text-xl text-ink'>
          “<span className='text-link'>{query}</span>” এর জন্য {bn(shown.length)}টি ফলাফল
        </h2>
        {all.length > 0 && (
          <ul aria-label='ধরন অনুযায়ী বাছাই' className='flex flex-wrap gap-2'>
            <li>
              <Link href={href(query)} aria-current={type === 'all' ? 'page' : undefined} className={CHIP}>
                সব
              </Link>
            </li>
            {TYPES.filter(t => counts[t] > 0).map(t => (
              <li key={t}>
                <Link href={href(query, t)} aria-current={type === t ? 'page' : undefined} className={CHIP}>
                  {SEARCH_TYPE_LABEL[t]} ({bn(counts[t])})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {shown.length > 0 ? (
        <ul aria-live='polite' className='mt-6 space-y-4'>
          {shown.map(result => (
            <li key={`${result.type}-${result.url}`} className='animate-fade-up'>
              <Link
                href={result.url}
                className='group/result flex flex-col gap-1.5 rounded-card border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift'
              >
                <span className='w-fit rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-link'>
                  {SEARCH_TYPE_LABEL[result.type]}
                </span>
                <span className='font-serif text-lg font-semibold text-ink transition group-hover/result:text-link'>
                  {result.title}
                </span>
                {result.text && <span className='text-sm text-ink-2'>{result.text}</span>}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className='mt-6 rounded-card border border-dashed border-line p-10 text-center'>
          <p className='font-serif text-xl font-semibold text-ink'>
            {failed ? 'এই মুহূর্তে খোঁজা যাচ্ছে না' : 'কিছুই পাওয়া যায়নি'}
          </p>
          <p className='mt-2 text-ink-2'>
            {failed
              ? 'একটু পরে আবার চেষ্টা করুন।'
              : 'বানান মিলিয়ে দেখুন, অথবা ছোট বা ভিন্ন শব্দ দিয়ে আবার চেষ্টা করুন।'}
          </p>
          <Link
            href='/shop'
            className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 mt-5'
          >
            সব পণ্য দেখুন
          </Link>
        </div>
      )}
    </section>
  )
}

function ResultsSkeleton () {
  return (
    <div aria-hidden='true' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10 max-w-4xl space-y-4'>
      {[0, 1, 2].map(i => (
        <div key={i} className='h-28 rounded-card border border-line bg-surface sk' />
      ))}
    </div>
  )
}
