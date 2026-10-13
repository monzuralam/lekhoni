import { cookies } from 'next/headers'
import { PREVIEW_COOKIE, isPreviewToken, previewCookieOptions, startPreview } from '@/lib/preview'

// GET /api/preview?token=… — the "Preview" link from WordPress
// (inc/preview.php). Trades the one-time token for a preview session
// (httpOnly cookie) and opens the preview, or explains that the link expired.
// GET because the editor opens it as a link; the token is single-use.
export async function GET (request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  const result = isPreviewToken(token) ? await startPreview(token) : null

  const headers = new Headers({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' })
  if (!result) {
    headers.set('Location', '/preview')
    return new Response(null, { status: 303, headers })
  }

  const store = await cookies()
  store.set(PREVIEW_COOKIE, result.session, previewCookieOptions)
  headers.set('Location', `/preview/${result.kind}/${result.id}`)
  return new Response(null, { status: 303, headers })
}
