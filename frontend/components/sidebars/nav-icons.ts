import {
  BarChart3,
  Circle,
  FileBarChart2,
  LayoutDashboard,
  Lightbulb,
  Receipt,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/** One icon per nav-item key, looked up by the sidebar at render time. */
export const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  "all-transactions": Receipt,
  income: TrendingUp,
  expenses: TrendingDown,
  sales: ShoppingCart,
  analytics: BarChart3,
  "ai-assistant": Sparkles,
  insights: Lightbulb,
  reports: FileBarChart2,
  account: UserRound,
};

/** Icon shown next to a group heading in the sidebar. */
export const NAV_GROUP_ICONS: Record<string, LucideIcon> = {
  Transactions: Receipt,
};

export const NAV_ICON_FALLBACK: LucideIcon = Circle;
