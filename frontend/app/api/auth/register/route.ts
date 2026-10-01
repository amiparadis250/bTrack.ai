import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_MAX_AGE } from "@/lib/auth-cookies";
import { backendFetch, parseBackendError } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  const res = await backendFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "register_failed", message } }, { status: res.status });
  }

  const tokens = await res.json();
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: ACCESS_TOKEN_MAX_AGE });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: REFRESH_TOKEN_MAX_AGE });

  return NextResponse.json({ success: true, data: {} });
}
