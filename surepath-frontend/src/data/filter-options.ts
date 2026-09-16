import type {
  MerchantStatus,
  Industry,
  Country,
  MerchantOwner,
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

export const merchantOwners: MerchantOwner[] = [
  "Unassigned",
  "Admin",
  "John Doe",
  "Jane Smith",
];