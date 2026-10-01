import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, ACTIVE_BUSINESS_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(ACTIVE_BUSINESS_COOKIE);

  return NextResponse.json({ success: true, message: "Logged out" });
}
