export type ResearchRunStatus =
  | "running"
  | "completed"
  | "failed";

export interface ResearchRun {
  id: string;
  merchant_id: string;
  status: ResearchRunStatus;
  error: string | null;
  started_at: Date;
  finished_at: Date | null;
  created_at: Date;
}

export interface ResearchRunRequest {
  merchant_id?: string;
  merchant_ids?: string[];
  limit?: number;
}

export interface ResearchRunResult {
  researched: number;
  merchant_ids: string[];
  failed: number;
  errors: unknown[];
  pages_found: number;
  pages_missing: number;
}