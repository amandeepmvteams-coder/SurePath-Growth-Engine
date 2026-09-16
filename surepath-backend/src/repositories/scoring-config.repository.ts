import { pool } from "../config/database";
import {
    ScoringConfig,
    UpdateScoringConfigData,
} from "../types/scoring-config.types";

class ScoringConfigRepository {
    async findActive(): Promise<ScoringConfig | null> {
        const result = await pool.query(
            `
      SELECT
        id,
        version,
        scoring_factors,
        factor_weights,
        criteria,
        attach_rate,
        revenue_per_order,
        commercial_assumptions,
        is_active,
        created_at,
        updated_at
      FROM scoring_configs
      WHERE is_active = TRUE
      ORDER BY version DESC
      LIMIT 1
      `
        );

        return result.rows[0] ?? null;
    }

    async findAll(): Promise<ScoringConfig[]> {
        const result = await pool.query(
            `
      SELECT
        id,
        version,
        scoring_factors,
        factor_weights,
        criteria,
        attach_rate,
        revenue_per_order,
        commercial_assumptions,
        is_active,
        created_at,
        updated_at
      FROM scoring_configs
      ORDER BY version DESC
      `
        );

        return result.rows;
    }

    async create(
        data: UpdateScoringConfigData,
        version: number
    ): Promise<ScoringConfig> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Deactivate the current configuration
            await client.query(
                `
      UPDATE scoring_configs
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE is_active = TRUE
      `
            );

            // Create the new active configuration
            const result = await client.query(
                `
      INSERT INTO scoring_configs (
        version,
        scoring_factors,
        factor_weights,
        criteria,
        attach_rate,
        revenue_per_order,
        commercial_assumptions,
        is_active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, TRUE
      )
      RETURNING
        id,
        version,
        scoring_factors,
        factor_weights,
        criteria,
        attach_rate,
        revenue_per_order,
        commercial_assumptions,
        is_active,
        created_at,
        updated_at
      `,
                [
                    version,
                    data.scoring_factors ?? {},
                    data.factor_weights ?? {},
                    data.criteria ?? {},
                    data.attach_rate ?? null,
                    data.revenue_per_order ?? null,
                    data.commercial_assumptions ?? {},
                ]
            );

            await client.query("COMMIT");

            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}

export const scoringConfigRepository =
    new ScoringConfigRepository();