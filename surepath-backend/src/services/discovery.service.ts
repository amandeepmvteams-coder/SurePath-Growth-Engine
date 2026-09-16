import {
    discoveryRepository,
} from "../repositories/discovery.repository";

import {
    discoverySourceService,
} from "./discovery-source.service";

import {
    provenanceService,
} from "./merchant-provenance.service";

import {
    DiscoveryRunRequest,
    DiscoveryRunResult,
    DiscoveryCandidate,
} from "../types/discovery.types";

class DiscoveryService {

    async runDiscovery(
        input: DiscoveryRunRequest
    ): Promise<DiscoveryRunResult> {

        const source =
            input.source || "mock";

        const limit =
            input.limit || 25;

        const candidates =
            await discoverySourceService.getCandidates(
                source,
                limit
            );

        const result: DiscoveryRunResult = {
            source,
            created: 0,
            updated: 0,
            failed: 0,
            total: candidates.length,
            errors: [],
            merchant_ids: [],
        };

        for (const candidate of candidates) {

            try {

                const domain =
                    this.normalizeDomain(
                        candidate.domain
                    );

                if (!domain) {
                    throw new Error(
                        "Invalid merchant domain"
                    );
                }

                const existing =
                    await discoveryRepository.findByDomain(
                        domain
                    );

                let merchant;

                /*
                 * Stores fields that have been manually overridden.
                 *
                 * These fields must not be overwritten by
                 * automated discovery.
                 */
                let protectedFields =
                    new Set<string>();

                if (existing) {

                    protectedFields =
                        await this.getProtectedFields(
                            existing.id
                        );

                    merchant =
                        await discoveryRepository.updateMerchant(
                            existing.id,
                            {
                                domain,

                                platform:
                                    protectedFields.has("platform")
                                        ? null
                                        : candidate.platform,

                                store_name:
                                    protectedFields.has("store_name")
                                        ? null
                                        : candidate.store_name,

                                country:
                                    protectedFields.has("country")
                                        ? null
                                        : candidate.country,

                                industry:
                                    protectedFields.has("industry")
                                        ? null
                                        : candidate.industry,

                                source,
                            }
                        );

                    result.updated++;

                } else {

                    merchant =
                        await discoveryRepository.createMerchant(
                            {
                                domain,

                                platform:
                                    candidate.platform,

                                store_name:
                                    candidate.store_name,

                                country:
                                    candidate.country,

                                industry:
                                    candidate.industry,

                                source,
                            }
                        );

                    result.created++;
                }

                /*
                 * Always return the merchant ID so the next
                 * pipeline stage can use it.
                 */
                result.merchant_ids.push(
                    merchant.id
                );

                /*
                 * Store provenance for the discovered data.
                 *
                 * Manual overrides are protected here as well,
                 * so automated discovery cannot replace them.
                 */
                await this.recordCandidateProvenance(
                    merchant.id,
                    candidate,
                    source,
                    domain,
                    protectedFields
                );

            } catch (error) {

                result.failed++;

                result.errors.push(
                    error instanceof Error
                        ? error.message
                        : "Unknown discovery error"
                );
            }
        }

        return result;
    }

    /**
     * Records provenance for every field discovered
     * from the discovery source.
     */
    private async recordCandidateProvenance(
        merchantId: string,
        candidate: DiscoveryCandidate,
        source: string,
        normalizedDomain: string,
        protectedFields: Set<string>
    ): Promise<void> {

        /*
         * Domain is the primary merchant identifier.
         */
        await this.recordFieldProvenance(
            merchantId,
            "domain",
            normalizedDomain,
            source,
            candidate
        );

        const fields: Array<{
            key: string;
            value: string | null | undefined;
        }> = [
            {
                key: "platform",
                value: candidate.platform,
            },
            {
                key: "store_name",
                value: candidate.store_name,
            },
            {
                key: "country",
                value: candidate.country,
            },
            {
                key: "industry",
                value: candidate.industry,
            },
        ];

        for (const field of fields) {

            /*
             * Skip fields for which discovery has no value.
             */
            if (
                field.value === null ||
                field.value === undefined
            ) {
                continue;
            }

            /*
             * Do not create a new automated provenance
             * record for a manually overridden field.
             */
            if (
                protectedFields.has(field.key)
            ) {
                continue;
            }

            await this.recordFieldProvenance(
                merchantId,
                field.key,
                String(field.value),
                source,
                candidate
            );
        }
    }

    /**
     * Common helper used to create provenance records.
     */
    private async recordFieldProvenance(
        merchantId: string,
        fieldKey: string,
        value: string,
        source: string,
        candidate: DiscoveryCandidate
    ): Promise<void> {

        await provenanceService.recordProvenance({
            merchant_id: merchantId,

            field_key: fieldKey,

            value,

            source,

            confidence:
                candidate.confidence ?? null,

            evidence:
                candidate.evidence ?? {
                    source,
                },
        });
    }

    /**
     * Normalizes a merchant domain.
     *
     * Examples:
     *
     * example.com
     * https://example.com
     * http://www.example.com
     *
     * become:
     *
     * example.com
     */
    private normalizeDomain(
        value: string
    ): string {

        let domain =
            value.trim().toLowerCase();

        if (!domain) {
            return "";
        }

        try {

            if (
                !domain.startsWith("http://") &&
                !domain.startsWith("https://")
            ) {
                domain =
                    `https://${domain}`;
            }

            const url =
                new URL(domain);

            return url.hostname
                .toLowerCase()
                .replace(/^www\./, "");

        } catch {

            return "";
        }
    }

    /**
     * Finds fields that were manually overridden
     * for the merchant.
     */
    private async getProtectedFields(
        merchantId: string
    ): Promise<Set<string>> {

        const provenance =
            await provenanceService.getMerchantProvenance(
                merchantId,
                true
            );

        return new Set(
            provenance
                .filter(
                    (item) =>
                        item.is_manual_override
                )
                .map(
                    (item) =>
                        item.field_key
                )
        );
    }
}

export const discoveryService =
    new DiscoveryService();