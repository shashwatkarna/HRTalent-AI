import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname from request headers
  const hostname = request.headers.get('host');
  
  // Exclude API, static files, and Next.js internals
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the request is on the "interview" subdomain
  // e.g. interview.hrtalent.ai or interview.localhost:3000
  if (hostname && hostname.startsWith('interview.')) {
    // We expect the URL to be just the candidate ID, e.g. interview.localhost:3000/123
    // We rewrite it internally to /interview/123
    const candidateId = url.pathname.split('/')[1]; // e.g. "/123" -> "123"
    
    if (candidateId) {
      // Rewrite the URL internally so Next.js serves the /interview/[id] page
      url.pathname = `/interview/${candidateId}`;
      return NextResponse.rewrite(url);
    } else {
      // If they just go to interview.hrtalent.ai/ without an ID, maybe show an error or redirect
      url.pathname = '/';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
