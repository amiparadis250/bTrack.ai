import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_MAX_AGE, ACTIVE_BUSINESS_COOKIE } from "@/lib/auth-cookies";
import { authedBackendFetch, parseBackendError } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  const res = await authedBackendFetch("/businesses", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "create_business_failed", message } }, { status: res.status });
  }

  const business = await res.json();
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BUSINESS_COOKIE, business.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE * 4 * 24 * 30,
  });

  return NextResponse.json({ success: true, data: business });
}
