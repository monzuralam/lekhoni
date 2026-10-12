import { cookies } from 'next/headers'
import { plainMessage, rawQuery, setSession } from '@/lib/auth'
import { AUTH_MESSAGES } from '@/app/components/auth/validation'

// Shared by the /api/auth/* Route Handlers. Not a route itself (no route.ts).

export type AuthCustomer = { databaseId: number; firstName: string | null; email: string | null }

type LoginResult = {
  login: { authToken: string; refreshToken: string; customer: AuthCustomer | null } | null
}

export async function readBody (request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null)
  return body && typeof body === 'object' ? body : {}
}

export function text (body: Record<string, unknown>, key: string) {
  return typeof body[key] === 'string' ? (body[key] as string) : ''
}

export function errorResponse (error: string, status: number) {
  return Response.json({ error }, { status })
}

// WordPress login errors -> Bangla
function loginError (raw: string) {
  const message = plainMessage(raw)
  if (/field is empty/i.test(message)) return { error: AUTH_MESSAGES.loginEmpty, status: 400 }
  if (/unknown (email|username)|not registered|invalid username|invalid email/i.test(message)) {
    return { error: AUTH_MESSAGES.unknownUser, status: 401 }
  }
  if (/password/i.test(message)) return { error: AUTH_MESSAGES.wrongPassword, status: 401 }
  return { error: AUTH_MESSAGES.loginFailed, status: 401 }
}

type SignInResult = { error: string; status: number } | { customer: AuthCustomer }

// Logs in with WPGraphQL JWT Authentication and saves both tokens as
// httpOnly cookies. `remember: false` makes the refresh cookie session-only.
export async function signIn (username: string, password: string, remember = true): Promise<SignInResult> {
  let json
  try {
    json = await rawQuery<LoginResult>(
      `mutation Login($username: String!, $password: String!) {
        login(input: { username: $username, password: $password }) {
          authToken
          refreshToken
          customer { databaseId firstName email }
        }
      }`,
      { username, password }
    )
  } catch {
    return { error: AUTH_MESSAGES.serverDown, status: 502 }
  }

  const login = json.data?.login
  if (!login?.authToken) {
    return loginError(json.errors?.[0]?.message ?? '')
  }

  await setSession(login.authToken, login.refreshToken)
  if (!remember) {
    // Same options as lib/auth.ts, minus maxAge: the cookie ends with the browser session
    const store = await cookies()
    store.set('lk-refresh', login.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
  }

  const customer = login.customer
  return {
    customer: {
      databaseId: customer?.databaseId ?? 0,
      firstName: customer?.firstName ?? null,
      email: customer?.email ?? null
    }
  }
}
