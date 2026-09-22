import { pool } from "../config/database";
import { PoolClient } from "pg";
import {
    Merchant,
    CreateMerchantData,
    UpdateMerchantData,
    MerchantListItem,
} from "../types/merchant.types";

class MerchantRepository {
    async findAll(
        limit = 20,
        offset = 0,
        q?: string,
        status?: string,
        platform?: string,
        country?: string,
        industry?: string,
        assignedRep?: string,
        sort = "created_at",
        direction = "desc"
    ): Promise<MerchantListItem[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        // Search domain or store name
        if (q) {
            values.push(`%${q}%`);

            conditions.push(
                `(m.domain ILIKE $${values.length} OR m.store_name ILIKE $${values.length})`
            );
        }

        // Status filter
        if (status) {
            values.push(status);
            conditions.push(`m.status = $${values.length}`);
        }

        // Platform filter
        if (platform) {
            values.push(platform);
            conditions.push(`m.platform = $${values.length}`);
        }

        // Country filter
        if (country) {
            values.push(country);
            conditions.push(`m.country = $${values.length}`);
        }

        // Industry filter
        if (industry) {
            values.push(industry);
            conditions.push(`m.industry = $${values.length}`);
        }

        // Assigned representative filter
        if (assignedRep === "unassigned") {
            conditions.push(`m.assigned_rep_id IS NULL`);
        } else if (assignedRep) {
            values.push(assignedRep);
            conditions.push(`m.assigned_rep_id = $${values.length}`);
        }

        // Allowed sorting fields
        const allowedSortFields = [
            "created_at",
            "updated_at",
            "domain",
            "store_name",
            "status",
            "platform",
            "country",
            "industry",
            "fit_score",
        ];

        const safeSort = allowedSortFields.includes(sort)
            ? sort
            : "created_at";

        // Allowed sort direction
        const safeDirection =
            direction.toLowerCase() === "asc"
                ? "ASC"
                : "DESC";

        const sortColumn =
            safeSort === "fit_score"
                ? "latest_score.fit_score"
                : `m.${safeSort}`;

        // Build WHERE clause
        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        // Pagination parameters
        values.push(limit);
        const limitIndex = values.length;

        values.push(offset);
        const offsetIndex = values.length;

        const result = await pool.query<MerchantListItem>(
            `
    SELECT
        m.*,

        CASE
            WHEN u.id IS NOT NULL THEN
                json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'display_name', u.display_name,
                    'email', u.email
                )
            ELSE NULL
        END AS assigned_rep,

        latest_score.fit_score,
        latest_score.score_factors_assessed,
        latest_score.score_factors_total,
        latest_score.opportunity_value,

        platform_provenance.platform_confidence,

        latest_research.last_researched_at

    FROM merchants m

    LEFT JOIN users u
        ON m.assigned_rep_id = u.id

    LEFT JOIN LATERAL (
        SELECT
            ms.score AS fit_score,
            ms.score_factors_assessed,
            ms.score_factors_total,
            ms.opportunity_value
        FROM merchant_scores ms
        WHERE ms.merchant_id = m.id
        ORDER BY ms.scored_at DESC
        LIMIT 1
    ) latest_score
        ON TRUE

    LEFT JOIN LATERAL (
        SELECT
            mp.confidence AS platform_confidence
        FROM merchant_provenance mp
        WHERE mp.merchant_id = m.id
          AND mp.field_key = 'platform'
          AND mp.is_current = TRUE
        ORDER BY mp.verified_at DESC NULLS LAST
        LIMIT 1
    ) platform_provenance
        ON TRUE

    LEFT JOIN LATERAL (
        SELECT
            rr.finished_at AS last_researched_at
        FROM research_runs rr
        WHERE rr.merchant_id = m.id
          AND rr.status = 'completed'
        ORDER BY rr.finished_at DESC NULLS LAST
        LIMIT 1
    ) latest_research
        ON TRUE

    ${whereClause}

   ORDER BY ${sortColumn} ${safeDirection} NULLS LAST

    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
    `,
            values
        );
        return result.rows;
    }

    async findById(id: string): Promise<Merchant | null> {
        const result = await pool.query(
            `
      SELECT *
      FROM merchants
      WHERE id = $1
      `,
            [id]
        );

        return result.rows[0] || null;
    }

    async findByDomain(domain: string): Promise<Merchant | null> {
        const result = await pool.query(
            `
      SELECT *
      FROM merchants
      WHERE domain = $1
      `,
            [domain]
        );

        return result.rows[0] || null;
    }

    async create(data: CreateMerchantData): Promise<Merchant> {
        const result = await pool.query(
            `
      INSERT INTO merchants (
        domain,
        platform,
        store_name,
        country,
        industry,
        source
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
            [
                data.domain,
                data.platform ?? null,
                data.store_name ?? null,
                data.country ?? null,
                data.industry ?? null,
                data.source ?? null,
            ]
        );

        return result.rows[0];
    }

    async update(
        id: string,
        data: UpdateMerchantData,
        client?: PoolClient
    ): Promise<Merchant | null> {
        const fields: string[] = [];
        const values: unknown[] = [];

        const allowedFields: (keyof UpdateMerchantData)[] = [
            "platform",
            "store_name",
            "country",
            "industry",
            "status",
            "assigned_rep_id",
            "next_follow_up_at",
            "outcome_reason",
            "outcome_at",
        ];

        allowedFields.forEach((key) => {
            if (key in data) {
                fields.push(`${key} = $${values.length + 1}`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push(`updated_at = NOW()`);

        values.push(id);

        const db = client ?? pool;

        const result = await db.query(
            `
  UPDATE merchants
  SET ${fields.join(", ")}
  WHERE id = $${values.length}
  RETURNING *
  `,
            values
        );

        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            `
      DELETE FROM merchants
      WHERE id = $1
      `,
            [id]
        );

        return (result.rowCount ?? 0) > 0;
    }

    async count(
        q?: string,
        status?: string,
        platform?: string,
        country?: string,
        industry?: string,
        assignedRep?: string
    ): Promise<number> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (q) {
            values.push(`%${q}%`);
            conditions.push(
                `(domain ILIKE $${values.length} OR store_name ILIKE $${values.length})`
            );
        }

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        if (platform) {
            values.push(platform);
            conditions.push(`platform = $${values.length}`);
        }

        if (country) {
            values.push(country);
            conditions.push(`country = $${values.length}`);
        }

        if (industry) {
            values.push(industry);
            conditions.push(`industry = $${values.length}`);
        }

        if (assignedRep === "unassigned") {
            conditions.push(`assigned_rep_id IS NULL`);
        } else if (assignedRep) {
            values.push(assignedRep);
            conditions.push(`assigned_rep_id = $${values.length}`);
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        const result = await pool.query(
            `
    SELECT COUNT(*)::int AS total
    FROM merchants
    ${whereClause}
    `,
            values
        );

        return result.rows[0].total;
    }

    async findForProfileRun(limit: number) {
        const result = await pool.query(
            `
        SELECT m.*
        FROM merchants m
        INNER JOIN research_runs rr
            ON rr.merchant_id = m.id
        WHERE rr.status = 'completed'
        GROUP BY m.id
        ORDER BY MAX(rr.created_at) DESC
        LIMIT $1
        `,
            [limit]
        );

        return result.rows;
    }

    async findForDetectionRun(limit: number) {
        const result = await pool.query(
            `
        SELECT m.*
        FROM merchants m
        INNER JOIN research_runs rr
            ON rr.merchant_id = m.id
        WHERE rr.status = 'completed'
        GROUP BY m.id
        ORDER BY MAX(rr.created_at) DESC
        LIMIT $1
        `,
            [limit]
        );

        return result.rows;
    }
}

export const merchantRepository = new MerchantRepository();