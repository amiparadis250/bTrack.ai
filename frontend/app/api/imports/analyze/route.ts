import { NextResponse } from "next/server";
import { getActiveBusinessId } from "@/lib/active-business";
import { authedBackendFormFetch, parseBackendError } from "@/lib/backend";

export async function POST(request: Request) {
  const businessId = await getActiveBusinessId();
  const formData = await request.formData();
  const res = await authedBackendFormFetch(`/businesses/${businessId}/imports/analyze`, formData);

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "analyze_failed", message } }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: await res.json() });
}
