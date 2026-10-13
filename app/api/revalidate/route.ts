import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'

// POST /api/revalidate { tags: string[] } with header X-Lekhoni-Revalidate-Secret.
// Called by WordPress (wp-content/themes/lekhoni/inc/headless.php) right after
// Theme Settings, menus or the site identity are saved, or the demo content is
// imported or removed, so the storefront
// shows the change on the next visit instead of after the cache expires.

// Only tags WordPress has a reason to clear. The demo import (inc/demo-import.php)
// touches everything, so it sends all of them.
const ALLOWED_TAGS = new Set([
  'theme-settings',
  'menus',
  'blog-settings',
  'posts',
  'pages',
  'products',
  'home-content',
  'home-products',
  'payment-gateways',
  'search'
])

function validSecret (given: string | null) {
  const expected = process.env.LEKHONI_REVALIDATE_SECRET
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST (request: Request) {
  if (!validSecret(request.headers.get('x-lekhoni-revalidate-secret'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const tags: string[] = Array.isArray(body?.tags)
    ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && ALLOWED_TAGS.has(tag))
    : []
  if (!tags.length) return Response.json({ error: 'No known tags' }, { status: 400 })

  // expire: 0 -> the next visit gets fresh data instead of a stale copy
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  return Response.json({ revalidated: tags })
}
