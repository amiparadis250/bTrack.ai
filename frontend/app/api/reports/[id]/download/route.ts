import { NextResponse } from "next/server";
import { getActiveBusinessId } from "@/lib/active-business";
import { authedBackendFetch } from "@/lib/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getActiveBusinessId();
  const res = await authedBackendFetch(`/businesses/${businessId}/reports/${id}/download`);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: { code: "download_report_failed", message: "We couldn't generate this report." } }, { status: res.status });
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = res.headers.get("content-disposition") ?? "attachment";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}
