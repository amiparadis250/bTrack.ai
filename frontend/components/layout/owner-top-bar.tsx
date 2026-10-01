"use client";

import { LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NAV_ICON_FALLBACK, NAV_ICONS } from "@/components/sidebars/nav-icons";
import { OWNER_NAV_GROUPS } from "@/components/sidebars/nav-items";

const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  OWNER_NAV_GROUPS.flatMap((group) => group.items).map((item) => [item.key, item.label])
);

export function OwnerTopBar({
  active,
  businessName,
  currency,
  onOpenNav,
  onLogout,
}: {
  active: string;
  businessName: string;
  currency: string;
  onOpenNav: () => void;
  onLogout: () => void;
}) {
  const title = SECTION_LABELS[active] ?? "Dashboard";
  const ActiveIcon = NAV_ICONS[active] ?? NAV_ICON_FALLBACK;
  const initials = businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-surface px-screen-h py-3 sm:gap-4 sm:px-6 sm:py-3.5">
      <button
        type="button"
        onClick={onOpenNav}
        className="shrink-0 rounded-lg p-2 text-text-dark transition-colors hover:bg-chip-surface lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden min-w-0 items-center gap-2 sm:flex">
        <ActiveIcon className="size-5 shrink-0 text-primary" />
        <h1 className="text-title-md truncate text-text-dark">{title}</h1>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-primary/30 bg-on-primary-container px-3.5 py-1.5 sm:flex">
          <span className="text-body-sm truncate font-semibold text-text-dark">{businessName}</span>
          <span className="text-caption text-primary-deep">{currency}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary-deep text-on-primary">{initials || "B"}</AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-chip-surface hover:text-text-dark"
            title="Log out"
          >
            <LogOut className="size-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
