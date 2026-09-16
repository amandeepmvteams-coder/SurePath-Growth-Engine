export interface MerchantExportFilters {
    q?: string;
    status?: string;
    platform?: string;
    country?: string;
    industry?: string;
    assignedRep?: string;
    sort?: string;
    direction?: string;
}

export interface MerchantExportRow {
    id: string;
    domain: string;
    store_name: string | null;
    country: string | null;
    industry: string | null;
    status: string;
    assigned_rep: string | null;
    fit_score: string | number | null;
    score_factors_assessed: number | null;
    score_factors_total: number | null;
    opportunity_value: string | number | null;
    platform_confidence: string | number | null;
    primary_contact_name: string | null;
    primary_contact_email: string | null;
    primary_contact_phone: string | null;
    detected_providers: string | null;
    source: string | null;
    created_at: Date | string;
    updated_at: Date | string;
}