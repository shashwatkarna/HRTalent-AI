import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { auth } from "@/auth";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Get hostname from request headers
  const hostname = request.headers.get('host');
  
  // Check if the request is on the "interview" subdomain
  // e.g. interview.hrtalent.ai or interview.localhost:3000
  if (hostname && hostname.startsWith('interview.')) {
    const candidateId = url.pathname.split('/')[1]; 
    
    if (candidateId) {
      url.pathname = `/interview/${candidateId}`;
      return NextResponse.rewrite(url);
    } else {
      url.pathname = '/';
      return NextResponse.rewrite(url);
    }
  }

  // TEMPORARY BYPASS FOR UI TESTING
  // In Next.js 16 Proxy, to let a request proceed normally, we simply return nothing.
  return;
  
  /* 
  // Future implementation with Auth.js
  const session = await auth();
  const authUrl = new URL(request.url);
  const pathname = authUrl.pathname;

  if (!session && pathname !== "/login") {
    return Response.redirect(new URL("/login", request.url));
  }
  
  if (session && pathname === "/login") {
    // @ts-ignore
    const role = session.user?.role;
    if (role === "ADMIN") return Response.redirect(new URL("/admin", request.url));
    return Response.redirect(new URL("/employee", request.url));
  }
  */
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
