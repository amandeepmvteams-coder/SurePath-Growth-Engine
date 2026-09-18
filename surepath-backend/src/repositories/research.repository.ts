import { pool } from "../config/database";
import {
    ResearchRun,
    ResearchRunStatus,
} from "../types/research-run.types";

class ResearchRunRepository {
    async create(merchantId: string): Promise<ResearchRun> {
        const result = await pool.query(
            `
      INSERT INTO research_runs (
        merchant_id,
        status
      )
      VALUES ($1, 'running')
      RETURNING
        id,
        merchant_id,
        status,
        error,
        started_at,
        finished_at,
        created_at
      `,
            [merchantId]
        );

        return result.rows[0];
    }

    async markCompleted(
        id: string
    ): Promise<ResearchRun> {
        const result = await pool.query(
            `
      UPDATE research_runs
      SET
        status = 'completed',
        finished_at = NOW(),
        error = NULL
      WHERE id = $1
      RETURNING
        id,
        merchant_id,
        status,
        error,
        started_at,
        finished_at,
        created_at
      `,
            [id]
        );

        return result.rows[0];
    }

    async markFailed(
        id: string,
        error: string
    ): Promise<ResearchRun> {
        const result = await pool.query(
            `
      UPDATE research_runs
      SET
        status = 'failed',
        finished_at = NOW(),
        error = $2
      WHERE id = $1
      RETURNING
        id,
        merchant_id,
        status,
        error,
        started_at,
        finished_at,
        created_at
      `,
            [id, error]
        );

        return result.rows[0];
    }

    async findByMerchantId(
        merchantId: string
    ): Promise<ResearchRun[]> {
        const result = await pool.query(
            `
      SELECT
        id,
        merchant_id,
        status,
        error,
        started_at,
        finished_at,
        created_at
      FROM research_runs
      WHERE merchant_id = $1
      ORDER BY created_at DESC
      `,
            [merchantId]
        );

        return result.rows;
    }

    async findLeastRecentlyResearched(
        limit: number
    ) {
        const result = await pool.query(
            `
      SELECT m.*
      FROM merchants m
      LEFT JOIN LATERAL (
        SELECT
          rr.finished_at
        FROM research_runs rr
        WHERE rr.merchant_id = m.id
        ORDER BY rr.created_at DESC
        LIMIT 1
      ) latest ON TRUE
      ORDER BY
        latest.finished_at ASC NULLS FIRST,
        m.created_at ASC
      LIMIT $1
      `,
            [limit]
        );

        return result.rows;
    }

    async findRunningByMerchantId(
        merchantId: string
    ): Promise<ResearchRun | null> {
        const result = await pool.query<ResearchRun>(
            `
        SELECT
            id,
            merchant_id,
            status,
            error,
            started_at,
            finished_at,
            created_at
        FROM research_runs
        WHERE merchant_id = $1
          AND status = 'running'
        LIMIT 1
        `,
            [merchantId]
        );

        return result.rows[0] ?? null;
    }
}

export const researchRunRepository =
    new ResearchRunRepository();