"use client";

import { useCallback, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OwnerSidebar } from "@/components/layout/owner-sidebar";
import { OwnerTopBar } from "@/components/layout/owner-top-bar";
import { OWNER_ROUTES } from "@/components/sidebars/nav-items";

const BASE_PATH = "/dashboard";
const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function OwnerShell({
  businessName,
  currency,
  children,
}: {
  businessName: string;
  currency: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [navOpenedOn, setNavOpenedOn] = useState<string | null>(null);
  const navOpen = navOpenedOn === pathname;
  const openNav = useCallback(() => setNavOpenedOn(pathname), [pathname]);
  const closeNav = useCallback(() => setNavOpenedOn(null), []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }, [router]);

  const active =
    pathname
      .slice(BASE_PATH.length)
      .split("/")
      .filter((segment) => segment && !UUID_SEGMENT.test(segment))
      .pop() ?? "dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <OwnerSidebar basePath={BASE_PATH} routes={OWNER_ROUTES} onLogout={handleLogout} />
      </div>

      {navOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <OwnerSidebar basePath={BASE_PATH} routes={OWNER_ROUTES} onLogout={handleLogout} />
          <button type="button" aria-label="Close menu" className="flex-1 bg-overlay-dark/60" onClick={closeNav} />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <OwnerTopBar
          active={active}
          businessName={businessName}
          currency={currency}
          onOpenNav={openNav}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-screen-h sm:p-section-gap">{children}</main>
      </div>
    </div>
  );
}
