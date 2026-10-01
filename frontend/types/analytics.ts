export interface AnalyticsOverview {
  period_start: string;
  period_end: string;
  revenue: string;
  expenses: string;
  profit: string;
  profit_margin: number | null;
  cash_inflow: string;
  cash_outflow: string;
  net_cash_flow: string;
  transaction_count: number;
}

export interface TrendPoint {
  period: string;
  revenue: string;
  expenses: string;
}

export interface CategoryBreakdownItem {
  category_id: string | null;
  category_name: string;
  total: string;
  percentage: number;
}
