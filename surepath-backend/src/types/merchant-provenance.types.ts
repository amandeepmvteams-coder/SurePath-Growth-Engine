export interface MerchantProvenance {
    id: string;
    merchant_id: string;
    field_key: string;
    value: string | null;
    source: string;
    confidence: string | null;
    evidence: Record<string, unknown> | null;
    verified_at: Date | null;
    is_current: boolean;
    is_manual_override: boolean;
    created_at: Date;
}

export interface CreateProvenanceInput {
    merchant_id: string;
    field_key: string;
    value: string | null;
    source: string;
    confidence?: number | null;
    evidence?: Record<string, unknown> | null;
    verified_at?: Date | null;
    is_manual_override?: boolean;
}