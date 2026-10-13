import { cookies } from 'next/headers'
import { PREVIEW_COOKIE } from '@/lib/preview'

// POST /api/preview/exit (the "প্রিভিউ বন্ধ করুন" form): forgets the preview
// session and goes to the live page when there is one, else the homepage.
export async function POST (request: Request) {
  const form = await request.formData().catch(() => null)
  const next = String(form?.get('next') ?? '')
  // Own paths only ("/x", not "//other.site")
  const target = /^\/(?![/\\])/.test(next) ? next : '/'

  const store = await cookies()
  store.delete(PREVIEW_COOKIE)
  return new Response(null, { status: 303, headers: { Location: target, 'Cache-Control': 'no-store' } })
}
