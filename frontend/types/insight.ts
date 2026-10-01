export type InsightType = "revenue_growth" | "revenue_decline" | "expense_increase" | "expense_concentration" | "margin_change";

export interface Insight {
  id: string;
  business_id: string;
  type: InsightType;
  title: string;
  description: string;
  period_start: string;
  period_end: string;
  supporting_data: Record<string, unknown>;
  created_at: string;
}

export interface ProjectionPoint {
  period: string;
  revenue: string;
  expenses: string;
}

export interface Projection {
  has_enough_data: boolean;
  based_on_months: number;
  history: ProjectionPoint[];
  projected_revenue: string | null;
  projected_expenses: string | null;
  projected_profit: string | null;
}
