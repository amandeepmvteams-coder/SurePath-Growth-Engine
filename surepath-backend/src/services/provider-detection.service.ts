import { researchPageRepository } from "../repositories/research-run.repository";
import { ResearchPage } from "../types/research.types";

interface ProviderDetectionResult {
    provider_name: string;
    is_detected: boolean;
    confidence: number;
    evidence: Record<string, unknown>;
}

interface ProviderRule {
    name: string;

    /*
     * Strong technical signals.
     * These are candidate provider domains/fingerprints and
     * should be refined as more real merchant examples are collected.
     */
    assetHosts: string[];

    /*
     * Specific textual signals.
     * Generic phrases such as "package protection" are deliberately
     * excluded because they can produce false positives.
     */
    keywords: string[];

    /*
     * Product/catalog signals from /products.json.
     * These are supporting signals, not sufficient by themselves.
     */
    productKeywords: string[];
}

const PROVIDER_RULES: ProviderRule[] = [
    {
        name: "Route",
        assetHosts: [
            "route.com",
        ],
        keywords: [
            "route package protection",
            "package protection by route",
            "route protect",
        ],
        productKeywords: [
            "route package protection",
            "package protection by route",
        ],
    },

    {
        name: "Corso",
        assetHosts: [
            "corso.com",
        ],
        keywords: [
            "corso protection",
            "corso shipping protection",
            "corso package protection",
        ],
        productKeywords: [
            "corso protection",
            "corso shipping protection",
        ],
    },

    {
        name: "SEEL",
        assetHosts: [
            "seel.com",
        ],
        keywords: [
            "seel protection",
            "seel worry-free purchase",
            "seel worry-free delivery",
        ],
        productKeywords: [
            "seel protection",
            "worry-free purchase",
            "worry-free delivery",
        ],
    },

    {
        name: "Navidium",
        assetHosts: [
            "navidiumapp.com",
        ],
        keywords: [
            "navidium protection",
            "navidium shipping protection",
        ],
        productKeywords: [
            "navidium protection",
            "navidium shipping protection",
        ],
    },

    {
        name: "Extend",
        assetHosts: [
            "extend.com",
        ],
        keywords: [
            "extend product protection",
            "extend protection",
            "extend warranty",
        ],
        productKeywords: [
            "extend product protection",
            "extend warranty",
        ],
    },

    /*
     * "Order Protection" is intentionally left without generic
     * keywords. It is a category rather than a reliable provider
     * fingerprint in the current implementation.
     */
    {
        name: "Order Protection",
        assetHosts: [],
        keywords: [],
        productKeywords: [],
    },
];

class ProviderDetectionService {

    async detectForMerchant(
        merchantId: string
    ): Promise<ProviderDetectionResult[]> {

        const pages =
            await researchPageRepository.findLatestCompletedByMerchantId(
                merchantId
            );

        if (pages.length === 0) {
            return [];
        }

        return this.detect(pages);
    }

    detect(
        pages: ResearchPage[]
    ): ProviderDetectionResult[] {

        const foundPages = pages.filter(
            (page) => page.status === "found"
        );

        return PROVIDER_RULES
            .map((provider) =>
                this.detectProvider(
                    provider,
                    foundPages
                )
            )
            .filter((result) => result.is_detected);
    }

    private detectProvider(
        provider: ProviderRule,
        pages: ResearchPage[]
    ): ProviderDetectionResult {

        const assetMatches: string[] = [];
        const keywordMatches: string[] = [];
        const productMatches: string[] = [];

        for (const page of pages) {

            const content =
                page.content ?? "";

            const lowerContent =
                content.toLowerCase();

            /*
             * -----------------------------------------
             * 1. Asset detection
             * -----------------------------------------
             */

            const assetUrls =
                this.extractAssetUrls(content);

            for (const assetUrl of assetUrls) {

                for (const host of provider.assetHosts) {

                    if (
                        this.assetMatchesHost(
                            assetUrl,
                            host
                        )
                    ) {
                        assetMatches.push(assetUrl);
                    }
                }
            }

            /*
             * -----------------------------------------
             * 2. Text detection
             * -----------------------------------------
             */

            for (
                const keyword
                of provider.keywords
            ) {

                if (
                    lowerContent.includes(
                        keyword.toLowerCase()
                    )
                ) {
                    keywordMatches.push(
                        keyword
                    );
                }
            }

            /*
             * -----------------------------------------
             * 3. products.json detection
             * -----------------------------------------
             */

            if (
                page.page_type ===
                "products_json"
            ) {

                const products =
                    this.extractProducts(
                        content
                    );

                for (
                    const product
                    of products
                ) {

                    const productText =
                        product.toLowerCase();

                    for (
                        const keyword
                        of provider.productKeywords
                    ) {

                        if (
                            productText.includes(
                                keyword.toLowerCase()
                            )
                        ) {
                            productMatches.push(
                                `${page.url}: ${product}`
                            );
                        }
                    }
                }
            }
        }

        const uniqueAssetMatches = [
            ...new Set(assetMatches),
        ];

        const uniqueKeywordMatches = [
            ...new Set(keywordMatches),
        ];

        const uniqueProductMatches = [
            ...new Set(productMatches),
        ];

        const hasAssetSignal =
            uniqueAssetMatches.length > 0;

        const hasKeywordSignal =
            uniqueKeywordMatches.length > 0;

        const hasProductSignal =
            uniqueProductMatches.length > 0;

        /*
         * -----------------------------------------
         * Confidence
         * -----------------------------------------
         *
         * Asset = strong technical evidence
         * Keyword = supporting evidence
         * Product = supporting evidence
         *
         * Product signal alone does NOT detect.
         */

        let confidence = 0;
        let isDetected = false;

        if (hasAssetSignal) {

            confidence = 0.95;
            isDetected = true;

        } else if (
            hasKeywordSignal &&
            hasProductSignal
        ) {

            confidence = 0.80;
            isDetected = true;

        } else if (
            hasKeywordSignal
        ) {

            confidence = 0.60;
            isDetected = true;
        }

        return {
            provider_name:
                provider.name,

            is_detected:
                isDetected,

            confidence,

            evidence: {
                asset_matches:
                    uniqueAssetMatches,

                keyword_matches:
                    uniqueKeywordMatches,

                product_matches:
                    uniqueProductMatches,
            },
        };
    }

    private extractAssetUrls(
        content: string
    ): string[] {

        const assets: string[] = [];

        const scriptMatches =
            content.matchAll(
                /<script[^>]+src=["']([^"']+)["']/gi
            );

        for (
            const match
            of scriptMatches
        ) {

            if (match[1]) {
                assets.push(match[1]);
            }
        }

        const linkMatches =
            content.matchAll(
                /<link[^>]+href=["']([^"']+)["']/gi
            );

        for (
            const match
            of linkMatches
        ) {

            if (match[1]) {
                assets.push(match[1]);
            }
        }

        return [
            ...new Set(assets),
        ];
    }

    private assetMatchesHost(
        assetUrl: string,
        expectedHost: string
    ): boolean {

        try {

            /*
             * Handle absolute URLs.
             */

            const parsed =
                new URL(assetUrl);

            const hostname =
                parsed.hostname
                    .toLowerCase();

            const normalizedHost =
                expectedHost
                    .toLowerCase();

            return (
                hostname === normalizedHost ||
                hostname.endsWith(
                    `.${normalizedHost}`
                )
            );

        } catch {

            /*
             * Relative URLs cannot identify
             * an external provider host.
             */

            return false;
        }
    }

    private extractProducts(
        content: string
    ): string[] {

        try {

            const parsed =
                JSON.parse(content);

            const products =
                Array.isArray(parsed.products)
                    ? parsed.products
                    : [];

            const values: string[] = [];

            for (
                const product
                of products
            ) {

                if (
                    product?.title
                ) {
                    values.push(
                        String(
                            product.title
                        )
                    );
                }

                if (
                    product?.vendor
                ) {
                    values.push(
                        String(
                            product.vendor
                        )
                    );
                }

                if (
                    product?.handle
                ) {
                    values.push(
                        String(
                            product.handle
                        )
                    );
                }

                if (
                    product?.body_html
                ) {
                    values.push(
                        String(
                            product.body_html
                        )
                    );
                }
            }

            return values;

        } catch {

            /*
             * Invalid JSON should not make
             * the entire detection run fail.
             */

            return [];
        }
    }
}

export const providerDetectionService =
    new ProviderDetectionService();