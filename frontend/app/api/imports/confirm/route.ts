import { NextResponse } from "next/server";
import { getActiveBusinessId } from "@/lib/active-business";
import { authedBackendFetch, parseBackendError } from "@/lib/backend";

export async function POST(request: Request) {
  const businessId = await getActiveBusinessId();
  const body = await request.json();
  const res = await authedBackendFetch(`/businesses/${businessId}/imports/confirm`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "confirm_import_failed", message } }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: await res.json() });
}
