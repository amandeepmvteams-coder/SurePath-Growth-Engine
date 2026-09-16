import { pool } from "../config/database";
import {
    MerchantScore,
    CreateMerchantScoreData,
} from "../types/merchant-score.types";

class MerchantScoreRepository {
    async findByMerchantId(
        merchantId: string
    ): Promise<MerchantScore[]> {
        const result = await pool.query(
            `
    SELECT
      id,
      merchant_id,
      scoring_config_id,
      score,
      score_factors_assessed,
      score_factors_total,
      score_breakdown,
      opportunity_value,
      opportunity_inputs,
      scored_at
    FROM merchant_scores
    WHERE merchant_id = $1
    ORDER BY scored_at DESC
    `,
            [merchantId]
        );

        return result.rows;
    }

    async create(
        data: CreateMerchantScoreData
    ): Promise<MerchantScore> {
        const result = await pool.query(
            `
    INSERT INTO merchant_scores (
      merchant_id,
      scoring_config_id,
      score,
      score_factors_assessed,
      score_factors_total,
      score_breakdown,
      opportunity_value,
      opportunity_inputs
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      merchant_id,
      scoring_config_id,
      score,
      score_factors_assessed,
      score_factors_total,
      score_breakdown,
      opportunity_value,
      opportunity_inputs,
      scored_at
    `,
            [
                data.merchant_id,
                data.scoring_config_id,
                data.score,
                data.score_factors_assessed,
                data.score_factors_total,
                data.score_breakdown ?? {},
                data.opportunity_value ?? null,
                data.opportunity_inputs ?? {},
            ]
        );

        return result.rows[0];
    }
}

export const merchantScoreRepository =
    new MerchantScoreRepository();