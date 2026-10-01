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
      { key: "analytics", label: "Analytics" },
      { key: "ai-assistant", label: "AI Assistant" },
      { key: "insights", label: "Insights" },
      { key: "reports", label: "Reports" },
    ],
  },
  { items: [{ key: "account", label: "Account" }] },
];

/** Canonical folder-based route per nav key, relative to "/dashboard". Import lives on the All Transactions page, not its own nav entry. */
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
  account: "account",
};

/** Builds the href for a nav key under a surface's base path (e.g. "/dashboard"). */
export function hrefForKey(basePath: string, routes: Record<string, string>, key: string): string {
  const segment = routes[key] ?? key;
  return segment ? `${basePath}/${segment}` : basePath;
}
