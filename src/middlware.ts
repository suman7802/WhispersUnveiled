import {getToken} from 'next-auth/jwt';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
export {default} from 'next-auth/middleware';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const token = await getToken({req: request});

  if (
    token &&
    (url.pathname === '/sign-in' ||
      url.pathname === '/sign-up' ||
      url.pathname === '/verify' ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sign-in', '/sign-up', '/verify/:path*', '/dashboard/:path*', '/'],
};
