import { NextResponse, type NextRequest } from 'next/server'

// Runs before rendering:
// 1. Translates WooCommerce's My account URLs (used in its emails and by the
//    WordPress front-end redirect) and the old /account URLs to our routes.
// 2. Real HTTP redirects for auth-gated pages. This only checks whether the
//    login cookies exist; the pages still verify the session itself (an
//    expired or revoked token falls back to their own streamed redirect).

const ACCOUNT = '/my-account'
const SIGNED_IN_COOKIES = ['lk-auth', 'lk-refresh']
const GUEST_ONLY = ['/login', '/register']

// WooCommerce endpoint -> our route (the rest of the path is kept)
const WOO_ENDPOINTS: Record<string, string> = {
  'view-order': `${ACCOUNT}/orders`, // /my-account/view-order/141 -> /my-account/orders/141
  'edit-address': `${ACCOUNT}/addresses`, // also /edit-address/billing|shipping
  'edit-account': `${ACCOUNT}/details`,
  'lost-password': '/forgot-password'
}

function legacyTarget (pathname: string) {
  // Old storefront URLs: /account/... -> /my-account/...
  if (pathname === '/account' || pathname.startsWith('/account/')) {
    return ACCOUNT + pathname.slice('/account'.length)
  }
  const [, base, endpoint, ...rest] = pathname.split('/')
  if (base !== ACCOUNT.slice(1) || !endpoint || !(endpoint in WOO_ENDPOINTS)) return null
  const target = WOO_ENDPOINTS[endpoint]
  // Only order ids carry over; edit-address/billing etc. land on the tab itself
  return endpoint === 'view-order' && rest[0] ? `${target}/${rest[0]}` : target
}

export function proxy (request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const legacy = legacyTarget(pathname)
  if (legacy) {
    const url = new URL(legacy, request.url)
    url.search = search
    // A reset link with a key belongs on the reset page, not the request form
    if (legacy === '/forgot-password' && request.nextUrl.searchParams.has('key')) {
      url.pathname = '/reset-password'
    }
    return NextResponse.redirect(url, 308)
  }

  const signedIn = SIGNED_IN_COOKIES.some(name => request.cookies.has(name))

  // Account pages need a login (the wishlist lives in the browser, so guests may use it)
  if (
    (pathname === ACCOUNT || pathname.startsWith(`${ACCOUNT}/`)) &&
    !pathname.startsWith(`${ACCOUNT}/wishlist`) &&
    !signedIn
  ) {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(login)
  }

  // Signed-in customers skip the login and register pages. Only a current
  // auth token counts here (its cookie expires with the token): a stale
  // refresh cookie alone could bounce between /my-account and /login forever.
  if (GUEST_ONLY.includes(pathname) && request.cookies.has('lk-auth')) {
    return NextResponse.redirect(new URL(ACCOUNT, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/my-account/:path*', '/account/:path*', '/login', '/register']
}
