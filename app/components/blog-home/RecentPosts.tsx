'use client'

import { useState, useTransition } from 'react'
import { bn } from '@/lib/bn'
import PostCard from '../blog/PostCard'
import type { CardPost } from '../blog/data'
import { loadMorePosts } from './actions'

// COMPONENT: RecentPosts (design/index.html). The first batch is rendered on
// the server; "আরো লেখা দেখুন" appends the next batch (server action).

function SkeletonCard () {
  return (
    <div aria-hidden='true' className='overflow-hidden rounded-card border border-line bg-surface'>
      <div className='aspect-video animate-pulse bg-surface-2' />
      <div className='space-y-3 p-5'>
        <div className='h-3 w-1/4 animate-pulse rounded-full bg-surface-2' />
        <div className='h-5 w-11/12 animate-pulse rounded-full bg-surface-2' />
        <div className='h-5 w-2/3 animate-pulse rounded-full bg-surface-2' />
        <div className='h-3 w-1/2 animate-pulse rounded-full bg-surface-2' />
      </div>
    </div>
  )
}

type RecentPostsProps = {
  initialPosts: CardPost[]
  initialHasMore: boolean
  linkTerms: boolean
  emptyText: string
}

export default function RecentPosts ({ initialPosts, initialHasMore, linkTerms, emptyText }: RecentPostsProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [status, setStatus] = useState('')
  const [pending, startTransition] = useTransition()

  function loadMore () {
    setStatus('আরো লেখা লোড হচ্ছে…')
    startTransition(async () => {
      try {
        const result = await loadMorePosts(posts.length)
        // Skip any post already shown (a new post can shift the list)
        const shown = new Set(posts.map(post => post.databaseId))
        const added = result.posts.filter(post => !shown.has(post.databaseId))
        setPosts(current => [...current, ...added])
        setHasMore(result.hasMore && added.length > 0)
        setStatus(result.hasMore ? `${bn(added.length)}টি নতুন লেখা যোগ হয়েছে।` : 'সব লেখা দেখানো হয়েছে।')
      } catch {
        setStatus('লেখা আনা যায়নি। আবার চেষ্টা করুন।')
      }
    })
  }

  if (!posts.length) {
    return <p className='rounded-card border border-line bg-surface p-6 text-center text-ink-2'>{emptyText}</p>
  }

  return (
    <>
      <div className='grid gap-6 sm:grid-cols-2'>
        {posts.map((post, index) => (
          <div
            key={post.databaseId}
            className={index >= initialPosts.length ? 'flex animate-fade-up [&>*]:flex-1' : 'flex [&>*]:flex-1'}
          >
            <PostCard post={post} variant='grid' linkTerms={linkTerms} />
          </div>
        ))}
        {pending && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>
      {(hasMore || status) && (
        <div className='mt-8 flex flex-col items-center gap-3'>
          {hasMore && (
            <button
              type='button'
              onClick={loadMore}
              disabled={pending}
              aria-busy={pending || undefined}
              className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 disabled:cursor-wait disabled:opacity-60'
            >
              আরো লেখা দেখুন
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-plus' />
              </svg>
            </button>
          )}
          <p aria-live='polite' className='min-h-6 text-sm text-muted'>
            {status}
          </p>
        </div>
      )}
    </>
  )
}
