import { authedBackendFetch } from "@/lib/backend";
import type { Insight, Projection } from "@/types/insight";

export async function listInsights(businessId: string): Promise<Insight[]> {
  const res = await authedBackendFetch(`/businesses/${businessId}/insights`);
  if (!res.ok) throw new Error("Failed to load insights.");
  return res.json();
}

export async function getProjection(businessId: string): Promise<Projection> {
  const res = await authedBackendFetch(`/businesses/${businessId}/insights/projection`);
  if (!res.ok) throw new Error("Failed to load the projection.");
  return res.json();
}
