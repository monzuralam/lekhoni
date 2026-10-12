import { errorResponse, readBody, text } from '../helpers'
import { rawQuery } from '@/lib/auth'
import { AUTH_MESSAGES } from '@/app/components/auth/validation'

// POST /api/auth/forgot { username } -> { ok: true }
// Always succeeds for valid input, so it never reveals which emails have accounts.
export async function POST (request: Request) {
  const username = text(await readBody(request), 'username').trim()
  if (!username || username.length > 254) return errorResponse(AUTH_MESSAGES.invalidInput, 400)

  try {
    await rawQuery(
      `mutation Forgot($username: String!) {
        sendPasswordResetEmail(input: { username: $username }) { success }
      }`,
      { username }
    )
  } catch {
    return errorResponse(AUTH_MESSAGES.serverDown, 502)
  }
  return Response.json({ ok: true })
}
