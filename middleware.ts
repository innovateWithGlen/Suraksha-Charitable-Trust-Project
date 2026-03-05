import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/donate",
    "/gallery",
    "/what-we-do",
    "/api/chat",
    "/api/contact",
    "/api/payments",
    "/api/auth",
    "/api/donations/public",
    "/api/content/public",
    "/api/gallery/public",
    "/admin/login",
  ];

  // Check if it's a public path
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  const hasSession = Boolean(
    req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value
  );

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
