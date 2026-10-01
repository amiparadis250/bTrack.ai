import { NextResponse } from "next/server";
import { authedBackendFetch, parseBackendError } from "@/lib/backend";

export async function PATCH(request: Request) {
  const body = await request.json();
  const res = await authedBackendFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "update_profile_failed", message } }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: await res.json() });
}
