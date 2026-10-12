'use server'

import { getBlogSettings, getPostsByIds, type CardPost } from '../blog/data'
import { getHomePostIds } from './data'

// "Load more" on the blog home: the next batch of recent posts after `offset`
// (the number already shown). The batch size is Settings > Reading > "Blog
// pages show at most".
export async function loadMorePosts (offset: number): Promise<{ posts: CardPost[]; hasMore: boolean }> {
  if (!Number.isInteger(offset) || offset < 0) return { posts: [], hasMore: false }
  const [{ rest }, settings] = await Promise.all([getHomePostIds(), getBlogSettings()])
  const posts = await getPostsByIds(rest.slice(offset, offset + settings.perPage))
  return { posts, hasMore: offset + settings.perPage < rest.length }
}
