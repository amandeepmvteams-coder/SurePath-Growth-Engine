export interface ScoringConfig {
  id: string;
  version: number;

  scoring_factors: Record<string, unknown>;
  factor_weights: Record<string, unknown>;
  criteria: Record<string, unknown>;

  attach_rate: number | null;
  revenue_per_order: number | null;

  commercial_assumptions: Record<string, unknown>;

  is_active: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface UpdateScoringConfigData {
  scoring_factors?: Record<string, unknown>;
  factor_weights?: Record<string, unknown>;
  criteria?: Record<string, unknown>;

  attach_rate?: number | null;
  revenue_per_order?: number | null;

  commercial_assumptions?: Record<string, unknown>;
}