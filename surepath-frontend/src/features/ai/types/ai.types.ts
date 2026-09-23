export type AITask =
    | "industry_classify"
    | "research_summary"
    | "policy_summary";

export interface AIRunRequest {
    merchant_id?: string;
    merchant_ids?: string[];
    limit?: number;
    tasks: AITask[];
}

export interface AIRunResponse {
    classified: number;
    summarised: number;
    policies_summarised: number;
    skipped_unchanged: number;
    rejected: number;
    errors: string[];
    per_task: Record<string, unknown>;
}