export interface AssignedRep {
    id: string;
    username: string;
    display_name: string | null;
    email: string | null;
}

export interface Merchant {
    id: string;
    domain: string;
    platform: string | null;
    store_name: string | null;
    country: string | null;
    industry: string | null;
    status: string;
    assigned_rep_id: string | null;
    assigned_rep?: AssignedRep | null;
    next_follow_up_at: string | null;
    outcome_reason: string | null;
    outcome_at: string | null;
    last_activity_at: string | null;
    source: string | null;
    created_at: string;
    updated_at: string;
}

export interface MerchantFilters {
    q?: string;
    status?: string;
    platform?: string;
    country?: string;
    industry?: string;
    assigned_rep?: string;
}

export interface MerchantSort {
    sort?: string;
    direction?: "asc" | "desc";
}

export interface GetMerchantsParams
    extends MerchantFilters,
    MerchantSort {
    limit?: number;
    offset?: number;
}

export interface MerchantPagination {
    total: number;
    limit: number;
    offset: number;
}

export interface GetMerchantsResponse {
    data: Merchant[];
    pagination: MerchantPagination;
}