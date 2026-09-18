export type ResearchRunStatus =
    | "running"
    | "completed"
    | "failed";

export interface ResearchRun {
    id: string;
    merchant_id: string;
    status: ResearchRunStatus;
    error: string | null;
    started_at: string;
    finished_at: string | null;
    created_at: string;
}