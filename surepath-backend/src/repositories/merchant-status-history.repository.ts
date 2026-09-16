import { pool } from "../config/database";
import { PoolClient } from "pg";
import {
    MerchantStatusHistory,
    CreateMerchantStatusHistoryData,
} from "../types/merchant-status-history.types";

class MerchantStatusHistoryRepository {
    async findByMerchantId(
        merchantId: string
    ): Promise<MerchantStatusHistory[]> {
        const result = await pool.query(
            `
      SELECT
        id,
        merchant_id,
        from_status,
        to_status,
        changed_by,
        changed_at
      FROM merchant_status_history
      WHERE merchant_id = $1
      ORDER BY changed_at DESC
      `,
            [merchantId]
        );

        return result.rows;
    }

    async create(
        data: CreateMerchantStatusHistoryData,
        client?: PoolClient
    ): Promise<MerchantStatusHistory> {
        const db = client ?? pool;

        const result = await db.query(
            `
      INSERT INTO merchant_status_history (
        merchant_id,
        from_status,
        to_status,
        changed_by
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        merchant_id,
        from_status,
        to_status,
        changed_by,
        changed_at
      `,
            [
                data.merchant_id,
                data.from_status,
                data.to_status,
                data.changed_by,
            ]
        );

        return result.rows[0];
    }
}

export const merchantStatusHistoryRepository =
    new MerchantStatusHistoryRepository();