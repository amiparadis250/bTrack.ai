import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  await backendFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Always succeed from the client's perspective -- never reveal whether an email is registered.
  return NextResponse.json({ success: true, data: {} });
}
