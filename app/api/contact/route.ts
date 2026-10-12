import { rawQuery } from '@/lib/auth'

// POST /api/contact { name, email, subject?, message, website? } -> { ok } | { error, field? }
// Forwards to the theme's `sendContactMessage` mutation (wp-content/themes/
// lekhoni/inc/contact.php), which stores the message in wp-admin and emails it.
// `website` is a honeypot: humans never see it, bots fill it in.

const MESSAGES: Record<string, { error: string; field?: string }> = {
  invalid_name: { error: 'আপনার নাম লিখুন।', field: 'name' },
  invalid_email: { error: 'সঠিক ইমেইল ঠিকানা লিখুন।', field: 'email' },
  invalid_message: { error: 'বার্তায় কমপক্ষে ২০ অক্ষর লিখুন।', field: 'message' },
  invalid_subject: { error: 'একটি বিষয় বেছে নিন।', field: 'subject' },
  too_many: { error: 'একটু আগেই বার্তা পাঠিয়েছেন। এক মিনিট পর আবার চেষ্টা করুন।' },
  server_error: { error: 'বার্তা পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।' }
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
    return Response.json(MESSAGES.too_many, { status: 429 })
  }

  const input = {
    name: text(body.name),
    email: text(body.email),
    subject: text(body.subject),
    message: text(body.message)
  }

  try {
    const json = await rawQuery<{ sendContactMessage: { success: boolean; code: string } | null }>(
      `mutation SendContactMessage($input: SendContactMessageInput!) {
        sendContactMessage(input: $input) { success code }
      }`,
      { input }
    )
    const result = json.data?.sendContactMessage
    if (result?.success) return Response.json({ ok: true })
    const mapped = MESSAGES[result?.code ?? ''] ?? MESSAGES.server_error
    return Response.json(mapped, { status: result?.code === 'too_many' ? 429 : 422 })
  } catch {
    return Response.json(MESSAGES.server_error, { status: 502 })
  }
}
