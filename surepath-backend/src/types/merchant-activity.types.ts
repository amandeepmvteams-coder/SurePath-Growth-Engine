export interface ActivityLoggedBy {
  id: string;
  username: string;
  display_name: string | null;
}

export interface MerchantActivity {
  id: string;
  merchant_id: string;

  activity_type: string;
  direction: string | null;
  channel: string | null;

  subject: string | null;
  body: string | null;

  detail: Record<string, unknown> | null;

  occurred_at: Date;

  logged_by_id: string | null;
  logged_by: ActivityLoggedBy | null;

  created_at: Date;
}

export interface CreateMerchantActivityData {
  activity_type: string;
  direction?: string;
  channel?: string;
  subject?: string;
  body?: string;
  detail?: Record<string, unknown>;
  occurred_at: Date;
  logged_by?: string;
}