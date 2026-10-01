import { authedBackendFetch } from "@/lib/backend";
import type { UploadedFile } from "@/types/import";

export async function listImports(businessId: string): Promise<UploadedFile[]> {
  const res = await authedBackendFetch(`/businesses/${businessId}/imports`);
  if (!res.ok) throw new Error("Failed to load import history.");
  return res.json();
}
