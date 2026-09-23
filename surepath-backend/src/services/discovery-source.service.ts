import {
    DiscoveryCandidate,
} from "../types/discovery.types";

class DiscoverySourceService {

    async getCandidates(
        source: string,
        limit: number
    ): Promise<DiscoveryCandidate[]> {

        switch (source) {

            case "mock":
                return this.getMockCandidates(limit);

            case "store_leads":
                return this.getStoreLeadCandidates(limit);

            default: {
                const error =
                    new Error(
                        "UNKNOWN_DISCOVERY_SOURCE"
                    );

                (
                    error as Error & {
                        statusCode?: number;
                    }
                ).statusCode = 400;

                throw error;
            }
        }
    }

    /**
     * Mock discovery source.
     *
     * These candidates use a real reachable
     * public test domain so that the complete
     * Discovery -> Research pipeline can be tested.
     */
    private getMockCandidates(
        limit: number
    ): DiscoveryCandidate[] {

        const candidates: DiscoveryCandidate[] = [
            {
            domain: "bombas.com",
            platform: "shopify",
            store_name: "Bombas",
            country: "United States",
            industry: "Apparel & Accessories",
            confidence: 0.95,
            evidence: {
                source: "mock",
                purpose: "discovery_pipeline_test",
            },
        },
        {
            domain: "kyliecosmetics.com",
            platform: "shopify",
            store_name: "Kylie Cosmetics",
            country: "United States",
            industry: "Beauty & Cosmetics",
            confidence: 0.95,
            evidence: {
                source: "mock",
                purpose: "discovery_pipeline_test",
            },
        },
        {
            domain: "colourpop.com",
            platform: "shopify",
            store_name: "ColourPop",
            country: "United States",
            industry: "Beauty & Cosmetics",
            confidence: 0.95,
            evidence: {
                source: "mock",
                purpose: "discovery_pipeline_test",
            },
        },
        ];

        return candidates.slice(
            0,
            limit
        );
    }

    /**
     * Store Leads integration is not configured yet.
     *
     * We intentionally do not invent the external
     * provider API or authentication details.
     */
    private async getStoreLeadCandidates(
        _limit: number
    ): Promise<DiscoveryCandidate[]> {

        const error =
            new Error(
                "STORE_LEADS_SOURCE_NOT_CONFIGURED"
            );

        (
            error as Error & {
                statusCode?: number;
            }
        ).statusCode = 503;

        throw error;
    }
}

export const discoverySourceService =
    new DiscoverySourceService();