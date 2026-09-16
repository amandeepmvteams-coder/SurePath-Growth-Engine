import { pool } from "../config/database";
import {
    MerchantNote,
    CreateMerchantNoteData,
} from "../types/merchant-note.types";

class MerchantNoteRepository {
    async findByMerchantId(
        merchantId: string
    ): Promise<MerchantNote[]> {
        const result = await pool.query(
            `
      SELECT
        n.id,
        n.merchant_id,
        n.author_id,
        CASE
          WHEN u.id IS NOT NULL THEN u.display_name
          ELSE NULL
        END AS author,
        n.body,
        n.created_at
      FROM merchant_notes n
      LEFT JOIN users u
        ON n.author_id = u.id
      WHERE n.merchant_id = $1
      ORDER BY n.created_at DESC
      `,
            [merchantId]
        );

        return result.rows;
    }

    async create(
        merchantId: string,
        data: CreateMerchantNoteData
    ): Promise<MerchantNote> {
        const result = await pool.query(
            `
      INSERT INTO merchant_notes (
        merchant_id,
        author_id,
        body
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        merchant_id,
        author_id,
        body,
        created_at
      `,
            [
                merchantId,
                data.author_id ?? null,
                data.body,
            ]
        );

        const noteId = result.rows[0].id;

        const noteResult = await pool.query(
            `
      SELECT
        n.id,
        n.merchant_id,
        n.author_id,
        CASE
          WHEN u.id IS NOT NULL THEN u.display_name
          ELSE NULL
        END AS author,
        n.body,
        n.created_at
      FROM merchant_notes n
      LEFT JOIN users u
        ON n.author_id = u.id
      WHERE n.id = $1
      `,
            [noteId]
        );

        return noteResult.rows[0];
    }

    
    async delete(
        merchantId: string,
        noteId: string
    ): Promise<boolean> {
        const result = await pool.query(
            `
    DELETE FROM merchant_notes
    WHERE merchant_id = $1
      AND id = $2
    `,
            [merchantId, noteId]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }
}

export const merchantNoteRepository =
    new MerchantNoteRepository();