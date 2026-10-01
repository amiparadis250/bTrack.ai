export interface NavItem {
  key: string;
  label: string;
  badge?: string | number;
}

/** Every bTrack.ai sidebar is built from groups -- an unlabeled group renders as flat rows, a labeled one is collapsible. */
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const OWNER_NAV_GROUPS: NavGroup[] = [
  { items: [{ key: "dashboard", label: "Dashboard" }] },
  {
    label: "Transactions",
    items: [
      { key: "all-transactions", label: "All Transactions" },
      { key: "income", label: "Income" },
      { key: "expenses", label: "Expenses" },
      { key: "sales", label: "Sales" },
    ],
  },
  {
    items: [
      { key: "import-data", label: "Import Data" },
      { key: "analytics", label: "Analytics" },
      { key: "ai-assistant", label: "AI Assistant" },
      { key: "insights", label: "Insights" },
      { key: "reports", label: "Reports" },
    ],
  },
  {
    items: [
      { key: "my-business", label: "My Business" },
      { key: "settings", label: "Settings" },
      { key: "profile", label: "Profile" },
    ],
  },
];

/** Canonical folder-based route per nav key, relative to "/dashboard". */
export const OWNER_ROUTES: Record<string, string> = {
  dashboard: "",
  "all-transactions": "transactions",
  income: "transactions/income",
  expenses: "transactions/expenses",
  sales: "transactions/sales",
  "import-data": "imports",
  analytics: "analytics",
  "ai-assistant": "ai-assistant",
  insights: "insights",
  reports: "reports",
  "my-business": "business",
  settings: "settings",
  profile: "profile",
};

/** Builds the href for a nav key under a surface's base path (e.g. "/dashboard"). */
export function hrefForKey(basePath: string, routes: Record<string, string>, key: string): string {
  const segment = routes[key] ?? key;
  return segment ? `${basePath}/${segment}` : basePath;
}
