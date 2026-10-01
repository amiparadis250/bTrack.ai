import { authedBackendFetch } from "@/lib/backend";
import type { AnalyticsOverview, CategoryBreakdownItem, TrendPoint } from "@/types/analytics";
import type { DateRange } from "@/lib/period";

export async function getOverview(businessId: string, range: DateRange): Promise<AnalyticsOverview> {
  const res = await authedBackendFetch(
    `/businesses/${businessId}/analytics/overview?date_from=${range.from}&date_to=${range.to}`
  );
  if (!res.ok) throw new Error("Failed to load analytics overview.");
  return res.json();
}

export async function getTrend(businessId: string, range: DateRange): Promise<TrendPoint[]> {
  const res = await authedBackendFetch(
    `/businesses/${businessId}/analytics/trend?date_from=${range.from}&date_to=${range.to}`
  );
  if (!res.ok) throw new Error("Failed to load the revenue/expense trend.");
  return res.json();
}

export async function getExpenseBreakdown(businessId: string, range: DateRange): Promise<CategoryBreakdownItem[]> {
  const res = await authedBackendFetch(
    `/businesses/${businessId}/analytics/expense-breakdown?date_from=${range.from}&date_to=${range.to}`
  );
  if (!res.ok) throw new Error("Failed to load the expense breakdown.");
  return res.json();
}
