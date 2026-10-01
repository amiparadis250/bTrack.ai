import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, ACTIVE_BUSINESS_COOKIE } from "@/lib/auth-cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  const hasBusiness = Boolean(request.cookies.get(ACTIVE_BUSINESS_COOKIE)?.value);

  const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  if (isAuthRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(hasBusiness ? "/dashboard" : "/onboarding", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.redirect(new URL(hasBusiness ? "/dashboard" : "/onboarding", request.url));
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/dashboard") && !hasBusiness) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/onboarding" && hasBusiness) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
