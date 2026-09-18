import { pool } from "../config/database";
import {
  ResearchPage,
  CreateResearchPageData,
} from "../types/research.types";

class ResearchPageRepository {
  async create(
    data: CreateResearchPageData
  ): Promise<ResearchPage> {
    const result = await pool.query(
      `
      INSERT INTO research_pages (
        research_run_id,
        merchant_id,
        url,
        page_type,
        status,
        status_code,
        content_type,
        title,
        content,
        error
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING
        id,
        research_run_id,
        merchant_id,
        url,
        page_type,
        status,
        status_code,
        content_type,
        title,
        content,
        fetched_at,
        error,
        created_at
      `,
      [
        data.research_run_id,
        data.merchant_id,
        data.url,
        data.page_type ?? null,
        data.status,
        data.status_code ?? null,
        data.content_type ?? null,
        data.title ?? null,
        data.content ?? null,
        data.error ?? null,
      ]
    );

    return result.rows[0];
  }

  async findByRunId(
    runId: string
  ): Promise<ResearchPage[]> {
    const result = await pool.query(
      `
      SELECT
        id,
        research_run_id,
        merchant_id,
        url,
        page_type,
        status,
        status_code,
        content_type,
        title,
        content,
        fetched_at,
        error,
        created_at
      FROM research_pages
      WHERE research_run_id = $1
      ORDER BY created_at ASC
      `,
      [runId]
    );

    return result.rows;
  }

  async findLatestCompletedByMerchantId(
    merchantId: string
) {
    const result = await pool.query(
        `
        SELECT rp.*
        FROM research_pages rp
        INNER JOIN research_runs rr
            ON rr.id = rp.research_run_id
        WHERE rp.merchant_id = $1
          AND rr.status = 'completed'
        AND rr.id = (
            SELECT id
            FROM research_runs
            WHERE merchant_id = $1
              AND status = 'completed'
            ORDER BY created_at DESC
            LIMIT 1
        )
        ORDER BY rp.created_at ASC
        `,
        [merchantId]
    );

    return result.rows;
}
}

export const researchPageRepository =
  new ResearchPageRepository();