export interface MerchantDetection {
    id: string;
    merchant_id: string;
    provider_name: string;
    is_detected: boolean;
    confidence: number | null;
    evidence: Record<string, unknown> | null;
    detected_at: string;
    source: string | null;
    is_manual_override: boolean;
    overridden_by: string | null;
    override_reason: string | null;
}