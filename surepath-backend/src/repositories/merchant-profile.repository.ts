import { pool } from "../config/database";
import {
    MerchantProfile,
    UpdateMerchantProfileData,
} from "../types/merchant-profile.types";

class MerchantProfileRepository {
    async findByMerchantId(
        merchantId: string
    ): Promise<MerchantProfile | null> {
        const result = await pool.query(
            `
      SELECT
        id,
        merchant_id,
        company_name,
        description,
        shipping_policy,
        return_policy,
        contact_email,
        contact_phone,
        shipping_policy_summary,
        return_policy_summary,
        research_summary,
        estimated_monthly_orders,
        avg_order_value,
        traffic_estimate,
        tech_stack,
        updated_at
      FROM merchant_profiles
      WHERE merchant_id = $1
      `,
            [merchantId]
        );

        return result.rows[0] ?? null;
    }

    async update(
        merchantId: string,
        data: UpdateMerchantProfileData
    ): Promise<MerchantProfile | null> {

        const fields: string[] = [];
        const values: unknown[] = [];

        if (data.estimated_monthly_orders !== undefined) {
            values.push(data.estimated_monthly_orders);
            fields.push(
                `estimated_monthly_orders = $${values.length}`
            );
        }

        if (data.avg_order_value !== undefined) {
            values.push(data.avg_order_value);
            fields.push(
                `avg_order_value = $${values.length}`
            );
        }

        if (data.research_summary !== undefined) {
            values.push(data.research_summary);
            fields.push(
                `research_summary = $${values.length}`
            );
        }

        if (data.shipping_policy_summary !== undefined) {
            values.push(data.shipping_policy_summary);
            fields.push(
                `shipping_policy_summary = $${values.length}`
            );
        }

        if (data.return_policy_summary !== undefined) {
            values.push(data.return_policy_summary);
            fields.push(
                `return_policy_summary = $${values.length}`
            );
        }

        if (fields.length === 0) {
            return this.findByMerchantId(merchantId);
        }

        fields.push("updated_at = NOW()");

        values.push(merchantId);

        const merchantIdIndex = values.length;

        const result = await pool.query(
            `
        UPDATE merchant_profiles
        SET ${fields.join(", ")}
        WHERE merchant_id = $${merchantIdIndex}
        RETURNING
            id,
            merchant_id,
            company_name,
            description,
            shipping_policy,
            return_policy,
            contact_email,
            contact_phone,
            shipping_policy_summary,
            return_policy_summary,
            research_summary,
            estimated_monthly_orders,
            avg_order_value,
            traffic_estimate,
            tech_stack,
            updated_at
        `,
            values
        );

        return result.rows[0] ?? null;
    }

    async upsertFromResearch(data: {
        merchant_id: string;
        company_name?: string | null;
        description?: string | null;
        shipping_policy?: string | null;
        return_policy?: string | null;
        contact_email?: string | null;
        contact_phone?: string | null;
        research_summary?: string | null;
    }) {
        const result = await pool.query(
            `
        INSERT INTO merchant_profiles (
            merchant_id,
            company_name,
            description,
            shipping_policy,
            return_policy,
            contact_email,
            contact_phone,
            research_summary,
            updated_at
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
            NOW()
        )
        ON CONFLICT (merchant_id)
        DO UPDATE SET
    company_name = EXCLUDED.company_name,
    description = EXCLUDED.description,
    shipping_policy = EXCLUDED.shipping_policy,
    return_policy = EXCLUDED.return_policy,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    research_summary = EXCLUDED.research_summary,
    updated_at = NOW()
        RETURNING *
        `,
            [
                data.merchant_id,
                data.company_name ?? null,
                data.description ?? null,
                data.shipping_policy ?? null,
                data.return_policy ?? null,
                data.contact_email ?? null,
                data.contact_phone ?? null,
                data.research_summary ?? null,
            ]
        );

        return result.rows[0];
    }
}

export const merchantProfileRepository =
    new MerchantProfileRepository();