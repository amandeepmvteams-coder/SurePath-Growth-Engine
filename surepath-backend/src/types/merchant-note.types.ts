export interface MerchantNote {
  id: string;
  merchant_id: string;
  author_id: string | null;
  author: string | null;
  body: string;
  created_at: Date;
}

export interface CreateMerchantNoteData {
  body: string;
  author_id?: string;
}