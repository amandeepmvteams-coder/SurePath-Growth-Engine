export interface MerchantDetection {
  id: string;
  merchant_id: string;
  provider_name: string;
  is_detected: boolean;
  confidence: number | null;
  evidence: Record<string, unknown> | null;
  detected_at: Date;
  source: string | null;
  is_manual_override: boolean;
  overridden_by: string | null;
  override_reason: string | null;
}

export interface CreateMerchantDetectionData {
  provider_name: string;
  is_detected: boolean;
  confidence?: number;
  evidence?: Record<string, unknown>;
  source?: string;
  overridden_by?: string;
  override_reason?: string;
}

export interface UpdateMerchantDetectionData {
  provider_name?: string;
  is_detected?: boolean;
  confidence?: number | null;
  evidence?: Record<string, unknown> | null;
  override_reason?: string;
}