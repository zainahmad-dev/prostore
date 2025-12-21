import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Lightweight middleware - avoid importing heavy dependencies like Prisma
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match auth routes only if needed
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};