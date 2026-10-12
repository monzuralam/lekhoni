import { errorResponse, readBody, text } from '../helpers'
import { plainMessage, rawQuery } from '@/lib/auth'
import { AUTH_MESSAGES, passwordError } from '@/app/components/auth/validation'

// POST /api/auth/reset { key, login, password } -> { ok: true } | { error }
export async function POST (request: Request) {
  const body = await readBody(request)
  const key = text(body, 'key').trim()
  const login = text(body, 'login').trim()
  const password = text(body, 'password')
  if (!key || !login) return errorResponse(AUTH_MESSAGES.resetInvalid, 400)
  const invalid = passwordError(password)
  if (invalid) return errorResponse(invalid, 400)

  let json
  try {
    json = await rawQuery<{ resetUserPassword: { user: { databaseId: number } | null } | null }>(
      `mutation Reset($key: String!, $login: String!, $password: String!) {
        resetUserPassword(input: { key: $key, login: $login, password: $password }) {
          user { databaseId }
        }
      }`,
      { key, login, password }
    )
  } catch {
    return errorResponse(AUTH_MESSAGES.serverDown, 502)
  }

  if (json.data?.resetUserPassword?.user?.databaseId) return Response.json({ ok: true })
  const message = plainMessage(json.errors?.[0]?.message ?? '')
  if (/invalid|expired|key/i.test(message)) return errorResponse(AUTH_MESSAGES.resetInvalid, 400)
  return errorResponse(AUTH_MESSAGES.resetFailed, 400)
}
