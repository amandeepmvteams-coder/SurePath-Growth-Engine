export interface ScoringRunRequest {
  merchant_id?: string;
  merchant_ids?: string[];
  limit?: number;
}

export interface ScoringRunResult {
  scored: number;
  skipped: number;
  opportunity_values: number;
  errors: unknown[];
}