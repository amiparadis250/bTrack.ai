"use client";

import { SidebarNav } from "@/components/sidebars/sidebar-nav";
import { OWNER_NAV_GROUPS } from "@/components/sidebars/nav-items";

export function OwnerSidebar({
  basePath,
  routes,
  onLogout,
}: {
  basePath: string;
  routes: Record<string, string>;
  onLogout: () => void;
}) {
  return (
    <SidebarNav
      subheading="Business Owner"
      roleLabel="Business Owner"
      groups={OWNER_NAV_GROUPS}
      basePath={basePath}
      routes={routes}
      onLogout={onLogout}
    />
  );
}
