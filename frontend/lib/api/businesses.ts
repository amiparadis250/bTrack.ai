import { authedBackendFetch } from "@/lib/backend";
import type { Business } from "@/types/business";

export async function getBusiness(businessId: string): Promise<Business> {
  const res = await authedBackendFetch(`/businesses/${businessId}`);
  if (!res.ok) throw new Error("Failed to load business profile.");
  return res.json();
}
