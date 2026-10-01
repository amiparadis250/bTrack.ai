import { NextResponse } from "next/server";
import { backendFetch, parseBackendError } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  const res = await backendFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "reset_failed", message } }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: {} });
}
