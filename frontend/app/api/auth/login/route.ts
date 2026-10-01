import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  ACTIVE_BUSINESS_COOKIE,
  ACTIVE_BUSINESS_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth-cookies";
import { backendFetch, parseBackendError } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  const res = await backendFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "login_failed", message } }, { status: res.status });
  }

  const tokens = await res.json();
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: ACCESS_TOKEN_MAX_AGE });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: REFRESH_TOKEN_MAX_AGE });

  // An existing account may already own a business (e.g. after logging back in on a fresh
  // session) -- without this, proxy.ts would send them to onboarding every time regardless.
  const businessesRes = await backendFetch("/businesses", undefined, tokens.access_token);
  if (businessesRes.ok) {
    const businesses = await businessesRes.json();
    const previouslyActive = cookieStore.get(ACTIVE_BUSINESS_COOKIE)?.value;
    const stillOwned = businesses.find((business: { id: string }) => business.id === previouslyActive);
    const business = stillOwned ?? businesses[0];
    if (business) {
      cookieStore.set(ACTIVE_BUSINESS_COOKIE, business.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: ACTIVE_BUSINESS_MAX_AGE,
      });
    }
  }

  return NextResponse.json({ success: true, data: {} });
}
