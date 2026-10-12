import { getPostIds, getStickyPostId } from '../blog/data'

// The blog home's posts: the featured one (newest sticky post, else the
// newest post) and the rest, newest first, for the "Recent posts" grid
export async function getHomePostIds () {
  const [ids, sticky] = await Promise.all([getPostIds(), getStickyPostId()])
  const featured = sticky ?? ids[0] ?? null
  return { featured, rest: ids.filter(id => id !== featured) }
}
