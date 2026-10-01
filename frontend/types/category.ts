export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  business_id: string;
  name: string;
  type: CategoryType;
  is_default: boolean;
}
