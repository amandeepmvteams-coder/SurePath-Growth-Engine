export interface MerchantScore {
  id: string;
  merchant_id: string;
  scoring_config_id: string;

  score: number;

  score_factors_assessed: number;
  score_factors_total: number;

  score_breakdown: Record<string, unknown>;

  opportunity_value: number | null;
  opportunity_inputs: Record<string, unknown>;

  scored_at: Date;
}

export interface CreateMerchantScoreData {
  merchant_id: string;
  scoring_config_id: string;

  score: number;

  score_factors_assessed: number;
  score_factors_total: number;

  score_breakdown?: Record<string, unknown>;

  opportunity_value?: number | null;
  opportunity_inputs?: Record<string, unknown>;
}