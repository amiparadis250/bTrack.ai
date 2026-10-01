export interface ParsedRow {
  row_number: number;
  raw: Record<string, string>;
}

export interface ColumnMapping {
  transaction_date: string | null;
  description: string | null;
  amount: string | null;
  type: string | null;
  category: string | null;
  payment_method: string | null;
}

export const MAPPING_FIELDS: { key: keyof ColumnMapping; label: string }[] = [
  { key: "transaction_date", label: "Transaction Date" },
  { key: "description", label: "Description" },
  { key: "amount", label: "Amount" },
  { key: "type", label: "Transaction Type" },
  { key: "category", label: "Category" },
  { key: "payment_method", label: "Payment Method" },
];

export interface AnalyzeResponse {
  filename: string;
  row_count: number;
  columns: string[];
  suggested_mapping: ColumnMapping;
  rows: ParsedRow[];
}

export type RowStatus = "valid" | "warning" | "invalid";

export interface ValidatedRow {
  row_number: number;
  status: RowStatus;
  issues: string[];
  transaction_date: string | null;
  description: string;
  amount: string | null;
  type: string;
  payment_method: string;
  category_id: string | null;
  category_name: string | null;
  suggested_category_id: string | null;
  suggested_category_name: string | null;
  suggested_category_confidence: number | null;
}

export interface ValidateResponse {
  valid_count: number;
  warning_count: number;
  invalid_count: number;
  rows: ValidatedRow[];
  ai_categorization_available: boolean;
}

export interface ConfirmRow {
  transaction_date: string;
  description: string;
  amount: string;
  type: string;
  payment_method: string;
  category_id: string | null;
}

export interface UploadedFile {
  id: string;
  business_id: string;
  filename: string;
  row_count: number;
  imported_count: number;
  created_at: string;
}
