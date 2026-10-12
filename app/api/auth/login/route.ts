import { errorResponse, readBody, signIn, text } from '../helpers'
import { AUTH_MESSAGES } from '@/app/components/auth/validation'

// POST /api/auth/login { username, password, remember? }
// -> { ok: true, customer: { databaseId, firstName, email } } | { error } (400/401)
// `username` can be an email or a WordPress username. `remember: false`
// keeps the refresh cookie for this browser session only (default: 30 days).
export async function POST (request: Request) {
  const body = await readBody(request)
  const username = text(body, 'username').trim()
  const password = text(body, 'password')
  if (!username || !password) return errorResponse(AUTH_MESSAGES.loginEmpty, 400)

  const result = await signIn(username, password, body.remember !== false)
  if ('error' in result) return errorResponse(result.error, result.status)
  return Response.json({ ok: true, customer: result.customer })
}
