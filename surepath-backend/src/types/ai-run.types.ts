export type AIRunTask =
    | "industry_classify"
    | "policy_summary"
    | "research_summary";


export interface AIRunRequest {
    merchant_id?: string;
    merchant_ids?: string[];
    limit?: number;
    tasks?: AIRunTask[];
}


export interface AIRunResult {
    classified: number;
    summarised: number;
    policies_summarised: number;
    skipped_unchanged: number;
    rejected: number;
    errors: string[];
    per_task: Record<string, unknown>;
}