export type DiscoverySource = "mock" | "store_leads";

export interface DiscoveryRunRequest {
    source?: DiscoverySource;
    limit?: number;
}

export interface DiscoveryCandidate {
    domain: string;
    platform?: string | null;
    store_name?: string | null;
    country?: string | null;
    industry?: string | null;

    estimated_monthly_orders?: number | null;
    avg_order_value?: number | null;

    evidence?: Record<string, unknown> | null;
    confidence?: number | null;
}

export interface DiscoveryRunResult {
    source: string;
    created: number;
    updated: number;
    failed: number;
    total: number;
    errors: string[];
    merchant_ids: string[];
}

