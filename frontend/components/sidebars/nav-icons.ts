import {
  BarChart3,
  Building2,
  Circle,
  FileBarChart2,
  LayoutDashboard,
  Lightbulb,
  Receipt,
  Settings,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UploadCloud,
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
  "import-data": UploadCloud,
  analytics: BarChart3,
  "ai-assistant": Sparkles,
  insights: Lightbulb,
  reports: FileBarChart2,
  "my-business": Building2,
  settings: Settings,
  profile: UserRound,
};

/** Icon shown next to a group heading in the sidebar. */
export const NAV_GROUP_ICONS: Record<string, LucideIcon> = {
  Transactions: Receipt,
};

export const NAV_ICON_FALLBACK: LucideIcon = Circle;
