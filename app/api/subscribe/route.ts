import { rawQuery } from '@/lib/auth'

// POST /api/subscribe { email, source?, website? } -> { ok } | { error, field? }
// Forwards to the theme's `subscribeNewsletter` mutation (wp-content/themes/
// lekhoni/inc/newsletter.php), which stores the address under Subscribers in
// wp-admin. An address that is already subscribed also answers { ok }.
// `website` is a honeypot: humans never see it, bots fill it in.

const MESSAGES: Record<string, { error: string; field?: string }> = {
  invalid_email: { error: 'সঠিক ইমেইল ঠিকানা লিখুন।', field: 'email' },
  too_many: { error: 'একটু আগেই চেষ্টা করেছেন। এক মিনিট পর আবার চেষ্টা করুন।' },
  rate_limited: { error: 'অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
  server_error: { error: 'সাবস্ক্রাইব করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।' }
}

// Small per-visitor limit on top of WordPress's own throttle (in memory, per server)
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const recent = new Map<string, number[]>()

function rateLimited (ip: string) {
  const now = Date.now()
  const hits = (recent.get(ip) ?? []).filter(time => now - time < WINDOW_MS)
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(ip, hits)
    return true
  }
  recent.set(ip, [...hits, now])
  if (recent.size > 5000) recent.clear()
  return false
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export async function POST (request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return Response.json({ error: MESSAGES.server_error.error }, { status: 400 })
  }

  // Bots that fill the hidden field get a fake success and nothing is saved
  if (text(body.website)) return Response.json({ ok: true })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'
  if (rateLimited(ip)) {
    return Response.json(MESSAGES.rate_limited, { status: 429 })
  }

  const email = text(body.email)
  if (!email || email.length > 254) {
    return Response.json(MESSAGES.invalid_email, { status: 422 })
  }
  const source = text(body.source).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40)

  try {
    const json = await rawQuery<{ subscribeNewsletter: { success: boolean; code: string } | null }>(
      `mutation SubscribeNewsletter($input: SubscribeNewsletterInput!) {
        subscribeNewsletter(input: $input) { success code }
      }`,
      { input: { email, source } }
    )
    const result = json.data?.subscribeNewsletter
    if (result?.success) return Response.json({ ok: true })
    const mapped = MESSAGES[result?.code ?? ''] ?? MESSAGES.server_error
    return Response.json(mapped, { status: result?.code === 'too_many' ? 429 : result ? 422 : 502 })
  } catch {
    return Response.json(MESSAGES.server_error, { status: 502 })
  }
}
