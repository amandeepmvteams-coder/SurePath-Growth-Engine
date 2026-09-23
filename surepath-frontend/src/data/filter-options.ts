import type {
  MerchantStatus,
  Industry,
  Country,
} from "@/types/merchant-types";

export const merchantStatuses: MerchantStatus[] = [
  "New",
  "Qualified",
  "Contacted",
  "Demo Scheduled",
  "Negotiating",
  "Installed",
  "Live",
  "Lost",
];

export const industries: Industry[] = [
  "Fashion",
  "Apparel",
  "Home & Furniture",
  "Beauty & Skincare",
  "Pets",
  "Health & Supplements",
  "Electronics",
  "Food & Beverage",
  "Other",
];

export const countries: Country[] = [
  "US",
  "UK",
  "Canada",
  "India",
];

