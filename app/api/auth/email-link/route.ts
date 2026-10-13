import { errorResponse, readBody, text } from '../helpers'
import { rawQuery } from '@/lib/auth'
import { AUTH_MESSAGES, isEmail, safeNext } from '@/app/components/auth/validation'

// POST /api/auth/email-link { email, next? } -> { ok: true } | { error }
// Asks WordPress (`sendLoginLink`, wp-content/themes/lekhoni/inc/email-login.php)
// to email a one-time login link. Answers OK whether or not the email has an
// account, so it can't be used to find out who is a customer.

// Small per-visitor limit on top of WordPress's own (in memory, per server)
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

export async function POST (request: Request) {
  const body = await readBody(request)
  const email = text(body, 'email').trim()
  if (!isEmail(email) || email.length > 254) return errorResponse(AUTH_MESSAGES.invalidInput, 400)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'
  if (rateLimited(ip)) return errorResponse(AUTH_MESSAGES.emailLinkTooMany, 429)

  // Only same-site paths; the default (My account) isn't worth putting in the link
  const next = safeNext(text(body, 'next'), '')

  const json = await rawQuery<{ sendLoginLink: { success: boolean; code: string } | null }>(
    `mutation SendLoginLink($email: String!, $next: String) {
      sendLoginLink(input: { email: $email, next: $next }) { success code }
    }`,
    { email, next: next || null }
  )
  const result = json.data?.sendLoginLink
  if (result?.success) return Response.json({ ok: true })

  switch (result?.code) {
    case 'disabled':
      return errorResponse(AUTH_MESSAGES.emailLinkDisabled, 403)
    case 'too_many':
      return errorResponse(AUTH_MESSAGES.emailLinkTooMany, 429)
    case 'invalid_email':
      return errorResponse(AUTH_MESSAGES.invalidInput, 400)
    default:
      return errorResponse(AUTH_MESSAGES.serverDown, 502)
  }
}
