export const REPORT_TYPES = ["financial_summary", "transactions", "sales", "expenses"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  financial_summary: "Financial Summary",
  transactions: "Transaction Report",
  sales: "Sales Report",
  expenses: "Expense Report",
};

export const REPORT_FORMATS = ["pdf", "excel"] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

export interface Report {
  id: string;
  business_id: string;
  report_type: ReportType;
  format: ReportFormat;
  period_start: string;
  period_end: string;
  created_at: string;
}
