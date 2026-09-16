import { pool } from "../config/database";
import QueryStream from "pg-query-stream";
import { MerchantExportFilters } from "../types/merchant-export.types";

class MerchantExportRepository {

    private buildQuery(filters: MerchantExportFilters) {
        const conditions: string[] = [];
        const values: unknown[] = [];

        /*
         * Search domain or store name
         */
        if (filters.q) {
            values.push(`%${filters.q}%`);

            conditions.push(
                `(m.domain ILIKE $${values.length}
                 OR m.store_name ILIKE $${values.length})`
            );
        }

        /*
         * Status
         */
        if (filters.status) {
            values.push(filters.status);

            conditions.push(
                `m.status = $${values.length}`
            );
        }

        /*
         * Platform
         */
        if (filters.platform) {
            values.push(filters.platform);

            conditions.push(
                `m.platform = $${values.length}`
            );
        }

        /*
         * Country
         */
        if (filters.country) {
            values.push(filters.country);

            conditions.push(
                `m.country = $${values.length}`
            );
        }

        /*
         * Industry
         */
        if (filters.industry) {
            values.push(filters.industry);

            conditions.push(
                `m.industry = $${values.length}`
            );
        }

        /*
         * Assigned representative
         */
        if (filters.assignedRep === "unassigned") {

            conditions.push(
                `m.assigned_rep_id IS NULL`
            );

        } else if (filters.assignedRep) {

            values.push(filters.assignedRep);

            conditions.push(
                `m.assigned_rep_id = $${values.length}`
            );
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        /*
         * Only allow sorting fields documented
         * by the Export API.
         */
        const allowedSortFields: Record<string, string> = {
            fit_score: "latest_score.score",
            opportunity_value: "latest_score.opportunity_value",
            platform_confidence: "platform_provenance.confidence",
            created_at: "m.created_at",
            updated_at: "m.updated_at",
        };

        const requestedSort = filters.sort ?? "created_at";

        const safeSort =
            allowedSortFields[requestedSort]
            ?? allowedSortFields.created_at;

        const safeDirection =
            filters.direction?.toLowerCase() === "asc"
                ? "ASC"
                : "DESC";

        const query = `
            SELECT
                m.id,
                m.domain,
                m.store_name,
                m.country,
                m.industry,
                m.status,
                m.source,
                m.created_at,
                m.updated_at,

                u.display_name AS assigned_rep,

                latest_score.score AS fit_score,

                latest_score.score_factors_assessed,

                latest_score.score_factors_total,

                latest_score.opportunity_value,

                platform_provenance.confidence
                    AS platform_confidence,

                primary_contact.name
                    AS primary_contact_name,

                primary_contact.email
                    AS primary_contact_email,

                primary_contact.phone
                    AS primary_contact_phone,

                detected_providers.providers
                    AS detected_providers

            FROM merchants m

            /*
             * Assigned sales representative
             */
            LEFT JOIN users u
                ON u.id = m.assigned_rep_id

            /*
             * Latest score
             */
            LEFT JOIN LATERAL (
                SELECT
                    ms.score,
                    ms.score_factors_assessed,
                    ms.score_factors_total,
                    ms.opportunity_value
                FROM merchant_scores ms
                WHERE ms.merchant_id = m.id
                ORDER BY ms.scored_at DESC
                LIMIT 1
            ) latest_score
                ON TRUE

            /*
             * Current platform provenance
             */
            LEFT JOIN LATERAL (
                SELECT
                    mp.confidence
                FROM merchant_provenance mp
                WHERE mp.merchant_id = m.id
                  AND mp.field_key = 'platform'
                  AND mp.is_current = TRUE
                ORDER BY mp.created_at DESC
                LIMIT 1
            ) platform_provenance
                ON TRUE

            /*
             * Primary contact
             */
            LEFT JOIN LATERAL (
                SELECT
                    mc.name,
                    mc.email,
                    mc.phone
                FROM merchant_contacts mc
                WHERE mc.merchant_id = m.id
                  AND mc.is_primary = TRUE
                ORDER BY mc.created_at ASC
                LIMIT 1
            ) primary_contact
                ON TRUE

            /*
             * Detected providers
             *
             * Only detections where is_detected = true
             * are included.
             */
            LEFT JOIN LATERAL (
                SELECT
                    STRING_AGG(
                        md.provider_name,
                        ', '
                        ORDER BY md.provider_name
                    ) AS providers
                FROM merchant_detections md
                WHERE md.merchant_id = m.id
                  AND md.is_detected = TRUE
            ) detected_providers
                ON TRUE

            ${whereClause}

            ORDER BY
                ${safeSort} ${safeDirection},
                m.id ASC
        `;

        return {
            query,
            values,
        };
    }

    async createExportStream(
        filters: MerchantExportFilters
    ) {
        const { query, values } =
            this.buildQuery(filters);

        const client = await pool.connect();

        const queryStream = new QueryStream(
            query,
            values
        );

        const stream = client.query(queryStream);

        /*
         * Release PostgreSQL connection when
         * streaming is finished.
         */
        const releaseClient = () => {
            client.release();
        };

        stream.on("end", releaseClient);
        stream.on("error", releaseClient);

        return stream;
    }
}

export const merchantExportRepository =
    new MerchantExportRepository();