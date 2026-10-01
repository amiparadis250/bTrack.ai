export const TRANSACTION_TYPES = ["income", "expense", "sale"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const PAYMENT_METHODS = ["cash", "bank", "mobile_money", "card", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank: "Bank",
  mobile_money: "Mobile Money",
  card: "Card",
  other: "Other",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  sale: "Sale",
};

export interface Transaction {
  id: string;
  business_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: string;
  description: string;
  transaction_date: string;
  payment_method: PaymentMethod;
  reference: string | null;
  source: "manual" | "import";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

export interface TransactionCreateInput {
  type: TransactionType;
  amount: string;
  description: string;
  category_id?: string | null;
  transaction_date: string;
  payment_method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
}
