"use client";

import { useState } from "react";
import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NAV_GROUP_ICONS, NAV_ICONS, NAV_ICON_FALLBACK } from "./nav-icons";
import { hrefForKey, type NavGroup } from "./nav-items";

/**
 * Sidebar shared by every role, admin and portal alike. Every row -- whether
 * it's a leaf item or a group that expands into children -- shares one
 * visual weight (same icon size, same text size/opacity); only the trailing
 * chevron marks a row as expandable. "Dashboard" is the one exception: a
 * standalone full-width pill, always visually distinct from the rest of the
 * list. Expanded groups draw a tree connector (trunk + branch per child)
 * down to their items. Each group's expand/collapse state is independent --
 * opening one has no effect on the others.
 *
 * Navigation is real routing (Link + the current pathname), not client
 * state -- `basePath` + `routes` resolve each item's key to its canonical
 * URL (see hrefForKey in nav-items.ts), so the same key always lands on the
 * same page regardless of which role's sidebar it's clicked from.
 */
export function SidebarNav({
  subheading,
  roleLabel,
  groups,
  basePath,
  routes,
  onLogout,
}: {
  subheading: string;
  roleLabel: string;
  groups: NavGroup[];
  basePath: string;
  routes: Record<string, string>;
  onLogout: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Accordion: at most one group open at a time. Until the user manually
  // toggles one, the group containing the current route auto-expands.
  const [manualExpanded, setManualExpanded] = useState<string | null>(null);

  function toggleGroup(label: string) {
    setManualExpanded((prev) => (prev === label ? "" : label));
  }

  function hrefFor(key: string) {
    return hrefForKey(basePath, routes, key);
  }

  // The item whose route is the longest prefix of the current path, so detail
  // pages keep their section lit (/deliveries/<id> -> Deliveries) while a more
  // specific item still wins (/deliveries/manual-queue -> Manual Queue).
  // The dashboard root only matches exactly -- it prefixes everything.
  const activeHref = groups
    .flatMap((group) => group.items.map((item) => hrefFor(item.key)))
    .filter((href) => pathname === href || (href !== basePath && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];

  function isItemActive(key: string) {
    return hrefFor(key) === activeHref;
  }

  const autoExpandLabel = groups.find(
    (group) => group.label && group.items.some((item) => isItemActive(item.key))
  )?.label;

  return (
    <aside className="flex w-80 max-w-[85vw] shrink-0 flex-col bg-sidebar-dark text-on-overlay-dark">
      <div className="border-b border-white/10 p-screen-h">
        <p className="text-title-md text-on-overlay-dark">bTrack.ai</p>
        <p className="text-caption text-on-overlay-dark/60">{subheading}</p>
      </div>
      <nav
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto p-screen-h",
          "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25"
        )}
      >
        {groups.map((group) => {
          // Only treat "dashboard" as the standalone pill when it's alone in
          // its group -- otherwise rendering just the pill would silently
          // drop every sibling item in that group.
          const dashboardItem =
            group.items.length === 1 && group.items[0].key === "dashboard" ? group.items[0] : undefined;

          if (dashboardItem) {
            const DashboardIcon = NAV_ICONS[dashboardItem.key] ?? NAV_ICON_FALLBACK;
            return (
              <Link
                key={dashboardItem.key}
                href={hrefFor(dashboardItem.key)}
                className={cn(
                  "mb-2 flex items-center justify-between rounded-full px-4 py-3 text-left transition-colors",
                  isItemActive(dashboardItem.key)
                    ? "bg-primary text-on-primary"
                    : "bg-white/5 text-on-overlay-dark hover:bg-white/10"
                )}
              >
                <span className="text-body-lg font-semibold whitespace-nowrap">{dashboardItem.label}</span>
                <DashboardIcon className="size-5 shrink-0" />
              </Link>
            );
          }

          if (!group.label) {
            return group.items.map((item) => (
              <NavRow key={item.key} item={item} href={hrefFor(item.key)} active={isItemActive(item.key)} />
            ));
          }

          const GroupIcon = NAV_GROUP_ICONS[group.label] ?? NAV_ICON_FALLBACK;
          const isExpanded = manualExpanded !== null ? manualExpanded === group.label : autoExpandLabel === group.label;
          // A group header only expands/collapses its items -- it isn't a page
          // of its own. It shares the active styling while one of its items is
          // the current page (parent in full, child in a lighter tone via NavRow).
          const isActive = group.items.some((item) => isItemActive(item.key));
          const panelId = `nav-group-${group.label.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            <div key={group.label} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => toggleGroup(group.label!)}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                className={cn(
                  "text-body-sm flex items-center justify-between rounded-md px-3 py-3 text-left transition-colors",
                  isActive
                    ? "bg-primary font-semibold text-on-primary"
                    : "text-on-overlay-dark/80 hover:bg-white/5"
                )}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <GroupIcon className="size-5 shrink-0" />
                  {group.label}
                </span>
                <ChevronDown
                  className={cn("size-4 shrink-0 transition-transform", isExpanded && "rotate-180")}
                />
              </button>
              {isExpanded ? (
                <div id={panelId} className="relative flex flex-col gap-1.5 pl-9">
                  <div className="absolute top-0 bottom-0 left-4 w-px bg-white/15" aria-hidden />
                  {group.items.map((item) => (
                    <div key={item.key} className="relative">
                      <span
                        className="absolute -left-5 top-1/2 h-px w-5 -translate-y-1/2 bg-white/15"
                        aria-hidden
                      />
                      <NavRow item={item} href={hrefFor(item.key)} active={isItemActive(item.key)} compact />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-screen-h">
        <p className="text-body-sm font-semibold text-on-overlay-dark">{roleLabel}</p>
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 bg-transparent text-on-overlay-dark hover:bg-white/10"
            onClick={() => router.push("/login")}
          >
            Switch Role
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 bg-transparent text-on-overlay-dark hover:bg-white/10"
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

function NavRow({
  item,
  href,
  active,
  compact,
}: {
  item: { key: string; label: string; badge?: string | number };
  href: string;
  active: boolean;
  compact?: boolean;
}) {
  const ItemIcon = NAV_ICONS[item.key] ?? NAV_ICON_FALLBACK;

  return (
    <Link
      href={href}
      className={cn(
        "text-body-sm flex w-full items-center justify-between rounded-md px-3 text-left transition-colors",
        compact ? "py-2" : "py-3",
        active
          ? compact
            ? "bg-primary/10 font-semibold text-primary"
            : "bg-primary font-semibold text-on-primary"
          : "text-on-overlay-dark/80 hover:bg-white/5"
      )}
    >
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <ItemIcon className="size-5 shrink-0" />
        {item.label}
      </span>
      {item.badge !== undefined ? (
        <Badge variant={active ? "secondary" : "outline"} className="border-white/20 text-system-yellow">
          {item.badge}
        </Badge>
      ) : null}
    </Link>
  );
}
