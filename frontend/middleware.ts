import { NextResponse, type NextRequest } from 'next/server';
import {
  AUTH_ROLE_COOKIE,
  getRoleDashboardPath,
  isUserRole,
  type UserRole,
} from './lib/auth-constants';

const protectedRoutes: Array<{ prefix: string; role: UserRole }> = [
  { prefix: '/owner', role: 'owner' },
  { prefix: '/tenant', role: 'tenant' },
];

const guestRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const role = isUserRole(roleCookie) ? roleCookie : null;
  const protectedRoute = protectedRoutes.find((route) => pathname.startsWith(route.prefix));

  if (protectedRoute) {
    if (!role) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);

      return NextResponse.redirect(loginUrl);
    }

    if (role !== protectedRoute.role) {
      return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
    }
  }

  if (role && guestRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/owner/:path*', '/tenant/:path*'],
};
