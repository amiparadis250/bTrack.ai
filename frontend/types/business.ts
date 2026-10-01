export const BUSINESS_TYPES = [
  "retail",
  "services",
  "food_beverage",
  "agriculture",
  "manufacturing",
  "other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  retail: "Retail",
  services: "Services",
  food_beverage: "Food & Beverage",
  agriculture: "Agriculture",
  manufacturing: "Manufacturing",
  other: "Other",
};

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  business_type: BusinessType;
  phone: string | null;
  email: string | null;
  location: string | null;
  currency: string;
  description: string | null;
  created_at: string;
}
