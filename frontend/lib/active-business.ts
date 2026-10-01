import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_BUSINESS_COOKIE } from "@/lib/auth-cookies";

/** Server Components only -- proxy.ts already guarantees this cookie exists under /dashboard, this is the typed read. */
export async function getActiveBusinessId(): Promise<string> {
  const id = (await cookies()).get(ACTIVE_BUSINESS_COOKIE)?.value;
  if (!id) redirect("/onboarding");
  return id;
}
