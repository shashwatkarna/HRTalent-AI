// import { auth } from "@/auth";

export async function proxy(request: Request) {
  // TEMPORARY BYPASS FOR UI TESTING
  // In Next.js 16 Proxy, to let a request proceed normally, we simply return nothing.
  return;
  
  /* 
  // Future implementation with Auth.js
  const session = await auth();
  const url = new URL(request.url);
  const pathname = url.pathname;

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
