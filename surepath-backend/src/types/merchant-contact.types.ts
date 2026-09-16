export interface ContactOwner {
  id: string;
  username: string;
  display_name: string | null;
}

export interface MerchantContact {
  id: string;
  merchant_id: string;

  name: string;
  role: string | null;

  email: string | null;
  phone: string | null;

  is_primary: boolean;

  owner_id: string | null;
  owner: ContactOwner | null;

  source: string | null;
  confidence: string | null;
  verified_at: Date | null;

  is_manual_override: boolean;

  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMerchantContactData {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
  created_by: string;
  owner_id?: string;
}

export interface UpdateMerchantContactData {
  name?: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
  created_by?: string;
  owner_id?: string | null;
}