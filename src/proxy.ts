import { NextResponse, type NextRequest } from 'next/server';
// Explicit URL language only; never infer a language from location or cookies.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-talentiques-language', /^\/en(?:\/|$)/.test(request.nextUrl.pathname) ? 'en' : 'fr');
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
