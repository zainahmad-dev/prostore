import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require a signed-in user. Everything else (home, product pages,
// search, cart) stays public so guests can browse and build up a cart.
const PROTECTED_PREFIXES = [
  '/admin',
  '/user',
  '/shipping-address',
  '/payment-method',
  '/place-order',
  '/order',
];

export async function middleware(request: NextRequest) {
  // Lightweight middleware - avoid importing heavy dependencies like Prisma.
  // Decodes the session JWT directly instead of importing '@/auth' (which pulls
  // in PrismaAdapter and isn't edge-safe).
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  // Auth.js v5 prefixes the session cookie with `__Secure-` when it is served
  // over HTTPS, and derives the JWT decryption salt from that same cookie name.
  // Without passing these, getToken() silently returns null in production and
  // every signed-in user gets bounced back to /sign-in.
  const useSecureCookies = request.nextUrl.protocol === 'https:';
  const cookieName = useSecureCookies
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

  const response = NextResponse.next();

  // Guests need a cart identifier before they can add anything to the cart.
  // Nothing else creates this cookie, so it has to be minted here.
  if (!request.cookies.get('sessionCartId')) {
    const sessionCartId = crypto.randomUUID();
    // Also set it on the request, so a Server Component/Action reading cookies()
    // during this same request already sees it.
    request.cookies.set('sessionCartId', sessionCartId);
    response.cookies.set('sessionCartId', sessionCartId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: useSecureCookies,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  if (!isProtected) return response;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: useSecureCookies,
    cookieName,
    salt: cookieName,
  });

  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set(
      'callbackUrl',
      `${pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  // Run on every page request (so the cart cookie is always present), but skip
  // API routes, Next internals and static assets.
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
