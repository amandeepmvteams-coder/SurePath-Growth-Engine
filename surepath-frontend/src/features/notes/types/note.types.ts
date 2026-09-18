export interface MerchantNote {
  id: string;
  merchant_id: string;
  author_id: string | null;
  author: string | null;
  body: string;
  created_at: string;
}

export interface CreateMerchantNoteData {
  body: string;
}