import { errorResponse, readBody, text } from '../../helpers'
import { rawQuery, setSession } from '@/lib/auth'
import { AUTH_MESSAGES } from '@/app/components/auth/validation'

// POST /api/auth/email-link/verify { token } -> { ok: true } | { error }
// Called by the "লগইন করুন" button on /login/link (a click rather than on
// page load, because email scanners open links). Swaps the one-time token
// (`loginWithEmailLink`) for the same JWT tokens as a password login and
// saves them as httpOnly cookies, so the customer is signed in for 30 days.
export async function POST (request: Request) {
  const token = text(await readBody(request), 'token')
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return errorResponse(AUTH_MESSAGES.emailLinkInvalid, 400)

  const json = await rawQuery<{
    loginWithEmailLink: { authToken: string | null; refreshToken: string | null; code: string } | null
  }>(
    `mutation LoginWithEmailLink($token: String!) {
      loginWithEmailLink(input: { token: $token }) { authToken refreshToken code }
    }`,
    { token }
  )
  const result = json.data?.loginWithEmailLink

  if (result?.authToken && result.refreshToken) {
    await setSession(result.authToken, result.refreshToken)
    return Response.json({ ok: true })
  }

  switch (result?.code) {
    case 'disabled':
      return errorResponse(AUTH_MESSAGES.emailLinkDisabled, 403)
    case 'invalid':
      return errorResponse(AUTH_MESSAGES.emailLinkInvalid, 400)
    default:
      return errorResponse(AUTH_MESSAGES.serverDown, 502)
  }
}
