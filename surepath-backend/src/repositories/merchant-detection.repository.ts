import { pool } from "../config/database";
import {
    MerchantDetection,
    CreateMerchantDetectionData,
    UpdateMerchantDetectionData,
} from "../types/merchant-detection.types";

class MerchantDetectionRepository {
    async findByMerchantId(
        merchantId: string
    ): Promise<MerchantDetection[]> {
        const result = await pool.query(
            `
      SELECT
        id,
        merchant_id,
        provider_name,
        is_detected,
        confidence,
        evidence,
        detected_at,
        source,
        is_manual_override,
        overridden_by,
        override_reason
      FROM merchant_detections
      WHERE merchant_id = $1
      ORDER BY detected_at DESC
      `,
            [merchantId]
        );

        return result.rows;
    }

    async findById(
        detectionId: string
    ): Promise<MerchantDetection | null> {
        const result = await pool.query(
            `
      SELECT
        id,
        merchant_id,
        provider_name,
        is_detected,
        confidence,
        evidence,
        detected_at,
        source,
        is_manual_override,
        overridden_by,
        override_reason
      FROM merchant_detections
      WHERE id = $1
      `,
            [detectionId]
        );

        return result.rows[0] ?? null;
    }

    async create(
        merchantId: string,
        data: CreateMerchantDetectionData
    ): Promise<MerchantDetection> {
        const result = await pool.query(
            `
      INSERT INTO merchant_detections (
        merchant_id,
        provider_name,
        is_detected,
        confidence,
        evidence,
        source,
        is_manual_override,
        overridden_by,
        override_reason
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      RETURNING
        id,
        merchant_id,
        provider_name,
        is_detected,
        confidence,
        evidence,
        detected_at,
        source,
        is_manual_override,
        overridden_by,
        override_reason
      `,
            [
                merchantId,
                data.provider_name,
                data.is_detected,
                data.confidence ?? null,
                data.evidence ?? null,
                data.source ?? null,
                true,
                data.overridden_by ?? null,
                data.override_reason ?? null,
            ]
        );

        return result.rows[0];
    }

    async update(
        detectionId: string,
        data: UpdateMerchantDetectionData
    ): Promise<MerchantDetection | null> {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (data.provider_name !== undefined) {
            fields.push(`provider_name = $${values.length + 1}`);
            values.push(data.provider_name);
        }

        if (data.is_detected !== undefined) {
            fields.push(`is_detected = $${values.length + 1}`);
            values.push(data.is_detected);
        }

        if (data.confidence !== undefined) {
            fields.push(`confidence = $${values.length + 1}`);
            values.push(data.confidence);
        }

        if (data.evidence !== undefined) {
            fields.push(`evidence = $${values.length + 1}`);
            values.push(data.evidence);
        }

        if (data.override_reason !== undefined) {
            fields.push(`override_reason = $${values.length + 1}`);
            values.push(data.override_reason);
        }

        fields.push(`is_manual_override = TRUE`);

        if (fields.length === 0) {
            return this.findById(detectionId);
        }

        values.push(detectionId);

        const result = await pool.query(
            `
      UPDATE merchant_detections
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING id
      `,
            values
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.findById(detectionId);
    }

    async hasDetectedProvider(
        merchantId: string
    ): Promise<boolean> {
        const result = await pool.query(
            `
    SELECT 1
    FROM merchant_detections
    WHERE merchant_id = $1
      AND is_detected = TRUE
    LIMIT 1
    `,
            [merchantId]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    async findLatestAutomatedByProvider(
        merchantId: string,
        providerName: string
    ): Promise<MerchantDetection | null> {
        const result = await pool.query(
            `
        SELECT
            id,
            merchant_id,
            provider_name,
            is_detected,
            confidence,
            evidence,
            detected_at,
            source,
            is_manual_override,
            overridden_by,
            override_reason
        FROM merchant_detections
        WHERE merchant_id = $1
          AND provider_name = $2
          AND is_manual_override = FALSE
        ORDER BY detected_at DESC
        LIMIT 1
        `,
            [merchantId, providerName]
        );

        return result.rows[0] ?? null;
    }

    async createAutomated(
        merchantId: string,
        data: CreateMerchantDetectionData
    ): Promise<MerchantDetection> {
        const result = await pool.query(
            `
        INSERT INTO merchant_detections (
            merchant_id,
            provider_name,
            is_detected,
            confidence,
            evidence,
            source,
            is_manual_override
        )
        VALUES ($1, $2, $3, $4, $5, $6, FALSE)
        RETURNING
            id,
            merchant_id,
            provider_name,
            is_detected,
            confidence,
            evidence,
            detected_at,
            source,
            is_manual_override,
            overridden_by,
            override_reason
        `,
            [
                merchantId,
                data.provider_name,
                data.is_detected,
                data.confidence ?? null,
                data.evidence ?? null,
                data.source ?? "research",
            ]
        );

        return result.rows[0];
    }

    async saveAutomatedDetection(
        merchantId: string,
        data: CreateMerchantDetectionData
    ): Promise<MerchantDetection | null> {

        const manualOverride = await pool.query(
            `
    SELECT
        id,
        merchant_id,
        provider_name,
        is_detected,
        confidence,
        evidence,
        detected_at,
        source,
        is_manual_override,
        overridden_by,
        override_reason
    FROM merchant_detections
    WHERE merchant_id = $1
      AND provider_name = $2
      AND is_manual_override = TRUE
    LIMIT 1
    `,
            [
                merchantId,
                data.provider_name,
            ]
        );

        if (manualOverride.rows.length > 0) {
            return null;
        }

        const existing = await pool.query(
            `
        SELECT id
        FROM merchant_detections
        WHERE merchant_id = $1
          AND provider_name = $2
          AND is_manual_override = FALSE
        ORDER BY detected_at DESC
        LIMIT 1
        `,
            [
                merchantId,
                data.provider_name,
            ]
        );

        if (existing.rows.length > 0) {
            const detectionId = existing.rows[0].id;

            const result = await pool.query(
                `
            UPDATE merchant_detections
            SET
                is_detected = $1,
                confidence = $2,
                evidence = $3,
                source = $4,
                detected_at = NOW()
            WHERE id = $5
            RETURNING
                id,
                merchant_id,
                provider_name,
                is_detected,
                confidence,
                evidence,
                detected_at,
                source,
                is_manual_override,
                overridden_by,
                override_reason
            `,
                [
                    data.is_detected,
                    data.confidence ?? null,
                    data.evidence ?? null,
                    data.source ?? "automated",
                    detectionId,
                ]
            );

            return result.rows[0];
        }

        const result = await pool.query(
            `
        INSERT INTO merchant_detections (
            merchant_id,
            provider_name,
            is_detected,
            confidence,
            evidence,
            source,
            is_manual_override
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, FALSE
        )
        RETURNING
            id,
            merchant_id,
            provider_name,
            is_detected,
            confidence,
            evidence,
            detected_at,
            source,
            is_manual_override,
            overridden_by,
            override_reason
        `,
            [
                merchantId,
                data.provider_name,
                data.is_detected,
                data.confidence ?? null,
                data.evidence ?? null,
                data.source ?? "automated",
            ]
        );

        return result.rows[0];
    }
}

export const merchantDetectionRepository =
    new MerchantDetectionRepository();