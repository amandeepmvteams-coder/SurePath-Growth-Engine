export interface ScoreBreakdownItem {
    reason: string;
    status: string;
    points_earned: number;
    maximum_points: number;
}

export interface MerchantScore {
    id: string;
    merchant_id: string;
    scoring_config_id: string;

    score: number;

    score_factors_assessed: number;
    score_factors_total: number;

    score_breakdown: Record<string, ScoreBreakdownItem>;

    opportunity_value: number | null;
    opportunity_inputs: Record<string, unknown>;

    scored_at: string;
}