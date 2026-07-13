import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Lightweight middleware - avoid importing heavy dependencies like Prisma.
  // Decodes the session JWT directly instead of importing '@/auth' (which pulls
  // in PrismaAdapter and isn't edge-safe).
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};