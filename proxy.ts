import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from './lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal next routes are always allowed
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  // If already logged in and visiting /login, redirect to main chat app
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Auth endpoints (login / logout) are publicly accessible
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // If unauthenticated:
  if (!isAuthenticated) {
    // API routes return 401 Unauthorized JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized: Access to this agent is protected. Please login.' },
        { status: 401 }
      );
    }

    // Web pages redirect to /login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

