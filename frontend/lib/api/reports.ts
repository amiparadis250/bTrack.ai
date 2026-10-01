import { authedBackendFetch } from "@/lib/backend";
import type { Report } from "@/types/report";

export async function listReports(businessId: string): Promise<Report[]> {
  const res = await authedBackendFetch(`/businesses/${businessId}/reports`);
  if (!res.ok) throw new Error("Failed to load report history.");
  return res.json();
}
