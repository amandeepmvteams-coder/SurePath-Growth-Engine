import { pool } from "../config/database";

class ProfileRunRepository {
    async findMerchantsByIds(
        merchantIds: string[]
    ) {
        const result = await pool.query(
            `
            SELECT *
            FROM merchants
            WHERE id = ANY($1::uuid[])
            `,
            [merchantIds]
        );

        return result.rows;
    }

    async findMerchantsForBatch(
        limit: number
    ) {
        const result = await pool.query(
            `
            SELECT m.*
            FROM merchants m
            WHERE EXISTS (
                SELECT 1
                FROM research_runs rr
                WHERE rr.merchant_id = m.id
                  AND rr.status = 'completed'
            )
            ORDER BY m.created_at ASC
            LIMIT $1
            `,
            [limit]
        );

        return result.rows;
    }

    async findMerchantById(
        merchantId: string
    ) {
        const result = await pool.query(
            `
            SELECT *
            FROM merchants
            WHERE id = $1
            `,
            [merchantId]
        );

        return result.rows[0] ?? null;
    }
}

export const profileRunRepository =
    new ProfileRunRepository();