import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { OwnerShell } from "@/components/layout/owner-shell";
import { getActiveBusinessId } from "@/lib/active-business";
import { authedBackendFetch } from "@/lib/backend";
import type { Business } from "@/types/business";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const businessId = await getActiveBusinessId();
  const res = await authedBackendFetch(`/businesses/${businessId}`);

  if (!res.ok) {
    redirect("/onboarding");
  }

  const business: Business = await res.json();

  return (
    <OwnerShell businessName={business.name} currency={business.currency}>
      {children}
    </OwnerShell>
  );
}
