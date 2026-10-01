import { authedBackendFetch } from "@/lib/backend";
import type { User } from "@/types/auth";

export async function getCurrentUser(): Promise<User> {
  const res = await authedBackendFetch("/auth/me");
  if (!res.ok) throw new Error("Failed to load the current user.");
  return res.json();
}
