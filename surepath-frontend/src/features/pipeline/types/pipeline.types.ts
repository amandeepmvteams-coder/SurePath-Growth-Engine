export type PipelineStageStatus =
    | "pending"
    | "running"
    | "completed"
    | "skipped"
    | "failed";

export type PipelineStageId =
    | "discovery"
    | "research"
    | "profile"
    | "detection"
    | "scoring"
    | "ai";

export interface DiscoveryRunResult {
    source: "mock" | "store_leads";
    created: number;
    updated: number;
    failed: number;
    total: number;
    errors: string[];
    merchant_ids: string[];
}

export interface ResearchRunResult {
    researched: number;
    merchant_ids: string[];
    failed: number;
    errors: unknown[];
    pages_found: number;
    pages_missing: number;
}

export interface ProfileRunResult {
    built: number;
    skipped: number;
    contacts_found: number;
    errors: string[];
}

export interface DetectionRunResult {
    merchants: number;
    detections: number;
    errors: string[];
}

export interface ScoringRunResult {
    scored: number;
    skipped: number;
    opportunity_values: number;
    errors: unknown[];
}
