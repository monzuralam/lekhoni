import { rawQuery } from '@/lib/auth'
import type { RawSinglePost } from '@/app/components/blog/single-post'
import type { WpPage } from '@/app/components/layout/WordPressPage'

// Storefront previews of unpublished posts and pages (WordPress side:
// wp-content/themes/lekhoni/inc/preview.php).
// 1. WordPress "Preview" -> /api/preview?token=<one-time handoff token>
// 2. That route trades it for a session token (1 hour, one post, one editor),
//    keeps it in the httpOnly lk-preview cookie and opens /preview/<kind>/<id>.
// 3. The preview page reads the post with the session token, uncached.

export const PREVIEW_COOKIE = 'lk-preview'
export const PREVIEW_MAX_AGE = 60 * 60 // matches the WordPress session

export const previewCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: PREVIEW_MAX_AGE
}

export const isPreviewToken = (token: unknown): token is string =>
  typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)

export type PreviewKind = 'post' | 'page'

export async function startPreview (token: string) {
  const json = await rawQuery<{
    lekhoniStartPreview: { session: string | null; kind: string | null; id: number | null } | null
  }>(
    `mutation StartPreview($token: String!) {
      lekhoniStartPreview(input: { token: $token }) { session kind id }
    }`,
    { token }
  )
  const result = json.data?.lekhoniStartPreview
  if (!result?.session || !result.id || (result.kind !== 'post' && result.kind !== 'page')) return null
  return { session: result.session, kind: result.kind as PreviewKind, id: result.id }
}

type Common = {
  status: string // draft, pending, future, private, publish
  link: string | null // live URI when published
}

export type PostPreview = Common & { kind: 'post' } & RawSinglePost
export type PagePreview = Common & { kind: 'page'; template: string } & WpPage

// The post or page as the editor last saved it (autosave included);
// null when the session has expired or belongs to another post
export async function getPreview (session: string, id: number): Promise<PostPreview | PagePreview | null> {
  const json = await rawQuery<{ lekhoniPreview: string | null }>(
    `query Preview($session: String!, $id: Int!) { lekhoniPreview(session: $session, id: $id) }`,
    { session, id }
  )
  const raw = json.data?.lekhoniPreview
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
