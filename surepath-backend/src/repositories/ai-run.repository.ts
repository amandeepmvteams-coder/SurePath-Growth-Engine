import { pool } from "../config/database";


class AIRunRepository {

    async findMerchantData(
        merchantId: string
    ) {

        const result = await pool.query(
            `
            SELECT
                m.id AS merchant_id,
                m.domain,
                m.platform,
                m.store_name,
                m.country,
                m.industry,

                mp.estimated_monthly_orders,
                mp.avg_order_value,

                mp.company_name,
                mp.description,
                mp.shipping_policy,
                mp.return_policy,
                mp.shipping_policy_summary,
                mp.return_policy_summary,
                mp.research_summary

            FROM merchants m

            LEFT JOIN merchant_profiles mp
                ON mp.merchant_id = m.id

            WHERE m.id = $1

            LIMIT 1
            `,
            [merchantId]
        );

        return result.rows[0] ?? null;
    }


    async findMerchantsData(
        merchantIds: string[]
    ) {

        if (merchantIds.length === 0) {
            return [];
        }

        const result = await pool.query(
            `
            SELECT
                m.id AS merchant_id,
                m.domain,
                m.platform,
                m.store_name,
                m.country,
                m.industry,

                mp.estimated_monthly_orders,
                mp.avg_order_value,

                mp.company_name,
                mp.description,
                mp.shipping_policy,
                mp.return_policy,
                mp.shipping_policy_summary,
                mp.return_policy_summary,
                mp.research_summary

            FROM merchants m

            LEFT JOIN merchant_profiles mp
                ON mp.merchant_id = m.id

            WHERE m.id = ANY($1::uuid[])

            ORDER BY m.created_at ASC
            `,
            [merchantIds]
        );

        return result.rows;
    }
}


export const aiRunRepository =
    new AIRunRepository();