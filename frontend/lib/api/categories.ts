import { authedBackendFetch } from "@/lib/backend";
import type { Category } from "@/types/category";

export async function listCategories(businessId: string): Promise<Category[]> {
  const res = await authedBackendFetch(`/businesses/${businessId}/categories`);
  if (!res.ok) throw new Error("Failed to load categories.");
  return res.json();
}
