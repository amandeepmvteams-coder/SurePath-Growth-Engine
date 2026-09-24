export interface MerchantListItem extends Merchant {
    fit_score: string | null;
    score_factors_assessed: number | null;
    score_factors_total: number | null;
    opportunity_value: string | null;
    last_researched_at: string | null;
}
export interface Merchant {
    id: string;
    domain: string;
    platform: string | null;
    platform_confidence: string | null;
    store_name: string | null;
    country: string | null;
    industry: string | null;
    status: string;
    assigned_rep_id: string | null;
    next_follow_up_at: Date | null;
    outcome_reason: string | null;
    outcome_at: Date | null;
    last_activity_at: Date | null;
    source: string | null;
    created_at: Date;
    updated_at: Date;


}

export interface CreateMerchantData {
    domain: string;
    platform?: string;
    store_name?: string;
    country?: string;
    industry?: string;
    source?: string;
}

export interface UpdateMerchantData {
    platform?: string | null;
    store_name?: string | null;
    country?: string | null;
    industry?: string | null;
    status?: string | null;
    assigned_rep_id?: string | null;
    next_follow_up_at?: Date | null;
    outcome_reason?: string | null;
    outcome_at?: Date | null;
}

