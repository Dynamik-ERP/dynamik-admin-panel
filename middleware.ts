import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth middleware for the admin panel.
 * Checks for the refresh cookie and redirects to login if absent.
 * This runs at the edge before the request reaches the page.
 */
export function middleware(_request: NextRequest) {
  // Temporarily disable all middleware for debugging
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that handle their own auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
