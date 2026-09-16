import { pool } from "../config/database";
import {
    CreateProvenanceInput,
    MerchantProvenance,
} from "../types/merchant-provenance.types";

class ProvenanceRepository {

    async findByMerchantId(
        merchantId: string,
        currentOnly: boolean = false
    ): Promise<MerchantProvenance[]> {

        const result = await pool.query<MerchantProvenance>(
            `
            SELECT
                id,
                merchant_id,
                field_key,
                value,
                source,
                confidence,
                evidence,
                verified_at,
                is_current,
                is_manual_override,
                created_at
            FROM merchant_provenance
            WHERE merchant_id = $1
            ${currentOnly ? "AND is_current = TRUE" : ""}
            ORDER BY field_key ASC, created_at DESC
            `,
            [merchantId]
        );

        return result.rows;
    }

    async findCurrentByField(
        merchantId: string,
        fieldKey: string
    ): Promise<MerchantProvenance | null> {

        const result = await pool.query<MerchantProvenance>(
            `
            SELECT
                id,
                merchant_id,
                field_key,
                value,
                source,
                confidence,
                evidence,
                verified_at,
                is_current,
                is_manual_override,
                created_at
            FROM merchant_provenance
            WHERE merchant_id = $1
              AND field_key = $2
              AND is_current = TRUE
            LIMIT 1
            `,
            [merchantId, fieldKey]
        );

        return result.rows[0] || null;
    }

    async replaceCurrent(
        input: CreateProvenanceInput
    ): Promise<MerchantProvenance> {

        const db = await pool.connect();

        try {
            await db.query("BEGIN");

            await db.query(
                `
                UPDATE merchant_provenance
                SET is_current = FALSE
                WHERE merchant_id = $1
                  AND field_key = $2
                  AND is_current = TRUE
                `,
                [
                    input.merchant_id,
                    input.field_key,
                ]
            );

            const result =
                await db.query<MerchantProvenance>(
                    `
                    INSERT INTO merchant_provenance (
                        merchant_id,
                        field_key,
                        value,
                        source,
                        confidence,
                        evidence,
                        verified_at,
                        is_current,
                        is_manual_override
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        TRUE,
                        $8
                    )
                    RETURNING
                        id,
                        merchant_id,
                        field_key,
                        value,
                        source,
                        confidence,
                        evidence,
                        verified_at,
                        is_current,
                        is_manual_override,
                        created_at
                    `,
                    [
                        input.merchant_id,
                        input.field_key,
                        input.value,
                        input.source,
                        input.confidence ?? null,
                        input.evidence ?? null,
                        input.verified_at ?? new Date(),
                        input.is_manual_override ?? false,
                    ]
                );

            await db.query("COMMIT");

            return result.rows[0];

        } catch (error) {

            await db.query("ROLLBACK");

            throw error;

        } finally {

            db.release();

        }
    }
}

export const provenanceRepository =
    new ProvenanceRepository();