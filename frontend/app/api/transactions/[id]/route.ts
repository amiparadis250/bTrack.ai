import { NextResponse } from "next/server";
import { getActiveBusinessId } from "@/lib/active-business";
import { authedBackendFetch, parseBackendError } from "@/lib/backend";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getActiveBusinessId();
  const body = await request.json();
  const res = await authedBackendFetch(`/businesses/${businessId}/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "update_transaction_failed", message } }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: await res.json() });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getActiveBusinessId();
  const res = await authedBackendFetch(`/businesses/${businessId}/transactions/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const message = await parseBackendError(res);
    return NextResponse.json({ success: false, error: { code: "delete_transaction_failed", message } }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: {} });
}
