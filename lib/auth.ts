import { cookies } from 'next/headers'

// Customer login via WPGraphQL JWT Authentication. Both tokens live in
// httpOnly cookies, so browser JavaScript never sees them:
// - lk-auth:    short-lived auth token (WordPress default: 5 minutes)
// - lk-refresh: long-lived refresh token (valid 1 year on the WP side)
// When the auth token is missing or expired, a new one is minted from the
// refresh token. Only Route Handlers / Server Functions can save it back to
// the cookie; Server Components just use it for the current render.

const AUTH_COOKIE = 'lk-auth'
const REFRESH_COOKIE = 'lk-refresh'
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // stay signed in for 30 days

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/'
}

type GraphQLResponse<T> = {
  data?: T
  errors?: { message: string }[]
}

function endpoint () {
  const url = process.env.WP_GRAPHQL_URL
  if (!url) throw new Error('WP_GRAPHQL_URL is not defined')
  return url
}

// Seconds until the JWT expires (negative when expired, -1 when unreadable)
function secondsLeft (token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return Number(payload.exp) - Math.floor(Date.now() / 1000)
  } catch {
    return -1
  }
}

const RETRY_DELAYS = [300, 1000, 2500]

// A busy WordPress can answer with an HTML error page (nginx 502) or drop
// the connection. Queries are retried; mutations are sent once. Either way a
// failure comes back as `errors`, like a GraphQL error.
export async function rawQuery<T> (query: string, variables: object = {}, token?: string | null) {
  const retries = /^\s*mutation\b/.test(query) ? 0 : RETRY_DELAYS.length
  let message = 'WordPress did not respond'
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt - 1]))
    let res: Response
    try {
      res = await fetch(endpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store'
      })
    } catch {
      continue // connection refused or reset
    }
    const text = await res.text()
    try {
      return JSON.parse(text) as GraphQLResponse<T>
    } catch {
      message = `WordPress returned ${res.status} instead of JSON`
      if (res.status < 500 && res.status !== 429) break
    }
  }
  return { errors: [{ message }] } as GraphQLResponse<T>
}

async function refreshAuthToken (refreshToken: string) {
  const json = await rawQuery<{ refreshJwtAuthToken: { authToken: string } | null }>(
    `mutation Refresh($token: String!) {
      refreshJwtAuthToken(input: { jwtRefreshToken: $token }) { authToken }
    }`,
    { token: refreshToken }
  )
  return json.data?.refreshJwtAuthToken?.authToken ?? null
}

// Save tokens after login (Route Handlers / Server Functions only)
export async function setSession (authToken: string, refreshToken?: string) {
  const store = await cookies()
  store.set(AUTH_COOKIE, authToken, {
    ...cookieOptions,
    maxAge: Math.max(60, secondsLeft(authToken))
  })
  if (refreshToken) {
    store.set(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_MAX_AGE })
  }
}

export async function clearSession () {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
  store.delete(REFRESH_COOKIE)
}

// A valid auth token for the signed-in customer, or null for guests.
// `persist: true` saves a refreshed token (only allowed outside rendering).
export async function getAuthToken ({ persist = false } = {}) {
  const store = await cookies()
  const auth = store.get(AUTH_COOKIE)?.value
  // Refresh a little early so the token doesn't expire mid-request
  if (auth && secondsLeft(auth) > 15) return auth

  const refresh = store.get(REFRESH_COOKIE)?.value
  if (!refresh) return null
  const fresh = await refreshAuthToken(refresh)
  if (persist) {
    if (fresh) await setSession(fresh)
    else await clearSession()
  }
  return fresh
}

export async function isSignedIn () {
  const store = await cookies()
  return store.has(REFRESH_COOKIE) || store.has(AUTH_COOKIE)
}

// GraphQL as the signed-in customer (falls back to a guest request)
export async function authQuery<T> (
  query: string,
  variables: object = {},
  options: { persist?: boolean } = {}
) {
  const token = await getAuthToken(options)
  return rawQuery<T>(query, variables, token)
}

// WordPress/WooCommerce messages contain HTML ("<strong>Error:</strong> ...")
export function plainMessage (message: string) {
  return message
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
