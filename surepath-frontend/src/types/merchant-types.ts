export type MerchantStatus =
  | "New"
  | "Qualified"
  | "Contacted"
  | "Demo Scheduled"
  | "Negotiating"
  | "Installed"
  | "Live"
  | "Lost";

export type Industry =
  | "Apparel"
  | "Home & Furniture"
  | "Beauty & Skincare"
  | "Pets"
  | "Health & Supplements"
  | "Electronics"
  | "Food & Beverage"
  | "Other";

export type Country =
  | "US"
  | "UK"
  | "Canada"
  | "India";

export type MerchantOwner =
  | "Unassigned"
  | "Admin"
  | "John Doe"
  | "Jane Smith";

/* Filter types */
export type StatusFilter = MerchantStatus | "all";
export type IndustryFilter = Industry | "all";
export type CountryFilter = Country | "all";
export type OwnerFilter = MerchantOwner | "all";

export interface Merchant {
  id: number;
  domain: string;
  store: string;
  country: Country;
  industry: Industry;
  status: MerchantStatus;
  owner: MerchantOwner | null;
  lastActivity: string;

  shopify?: number;
  fit?: number | null;
  enrichment?: string;
  source?: string;
}