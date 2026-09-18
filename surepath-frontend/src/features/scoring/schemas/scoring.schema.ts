import { z } from "zod";

export const scoreBreakdownItemSchema = z.object({
    reason: z.string(),
    status: z.string(),
    points_earned: z.number(),
    maximum_points: z.number(),
});

export const merchantScoreSchema = z.object({
    id: z.string(),
    merchant_id: z.string(),
    scoring_config_id: z.string(),

    score: z.coerce.number(),

    score_factors_assessed: z.number(),
    score_factors_total: z.number(),

    score_breakdown: z.record(
        z.string(),
        scoreBreakdownItemSchema
    ),

    opportunity_value: z.coerce.number().nullable(),

    opportunity_inputs: z.record(
        z.string(),
        z.unknown()
    ),

    scored_at: z.string(),
});

export const merchantScoresSchema = z.array(
    merchantScoreSchema
);