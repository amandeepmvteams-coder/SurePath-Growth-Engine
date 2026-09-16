import { pool } from "../config/database";

export interface DiscoveryMerchant {
    id: string;
    domain: string;
    platform: string | null;
    store_name: string | null;
    country: string | null;
    industry: string | null;
    status: string;
    source: string | null;
}

export interface UpsertDiscoveryMerchantInput {
    domain: string;
    platform?: string | null;
    store_name?: string | null;
    country?: string | null;
    industry?: string | null;
    source: string;
}

class DiscoveryRepository {

    async findByDomain(
        domain: string
    ): Promise<DiscoveryMerchant | null> {

        const result =
            await pool.query<DiscoveryMerchant>(
                `
                SELECT
                    id,
                    domain,
                    platform,
                    store_name,
                    country,
                    industry,
                    status,
                    source
                FROM merchants
                WHERE domain = $1
                LIMIT 1
                `,
                [domain]
            );

        return result.rows[0] || null;
    }

    async createMerchant(
        input: UpsertDiscoveryMerchantInput
    ): Promise<DiscoveryMerchant> {

        const result =
            await pool.query<DiscoveryMerchant>(
                `
                INSERT INTO merchants (
                    domain,
                    platform,
                    store_name,
                    country,
                    industry,
                    status,
                    source
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    'New',
                    $6
                )
                RETURNING
                    id,
                    domain,
                    platform,
                    store_name,
                    country,
                    industry,
                    status,
                    source
                `,
                [
                    input.domain,
                    input.platform ?? null,
                    input.store_name ?? null,
                    input.country ?? null,
                    input.industry ?? null,
                    input.source,
                ]
            );

        return result.rows[0];
    }

    async updateMerchant(
        merchantId: string,
        input: UpsertDiscoveryMerchantInput
    ): Promise<DiscoveryMerchant> {

        const result =
            await pool.query<DiscoveryMerchant>(
                `
                UPDATE merchants
                SET
                    platform = COALESCE($2, platform),
                    store_name = COALESCE($3, store_name),
                    country = COALESCE($4, country),
                    industry = COALESCE($5, industry),
                    source = $6,
                    updated_at = NOW()
                WHERE id = $1
                RETURNING
                    id,
                    domain,
                    platform,
                    store_name,
                    country,
                    industry,
                    status,
                    source
                `,
                [
                    merchantId,
                    input.platform ?? null,
                    input.store_name ?? null,
                    input.country ?? null,
                    input.industry ?? null,
                    input.source,
                ]
            );

        return result.rows[0];
    }
}

export const discoveryRepository =
    new DiscoveryRepository();