import { ResearchPage } from "../types/research.types";

export type PlatformName =
    | "shopify"
    | "woocommerce"
    | "magento"
    | "bigcommerce"
    | "prestashop"
    | "opencart"
    | "unknown";

export type SignalStrength = "strong" | "medium" | "weak";

export interface PlatformSignal {
    signal: string;
    platform: Exclude<PlatformName, "unknown">;
    strength: SignalStrength;
    source: string;
}

export interface PlatformDetectionEvidence extends Record<string, unknown> {
    signals: PlatformSignal[];
    pages: string[];
    summary: string;
}

export interface PlatformDetectionResult {
    platform: PlatformName;
    confidence: number;
    evidence: PlatformDetectionEvidence;
}

interface SignalMatcher {
    signal: string;
    strength: SignalStrength;
    regex: RegExp;
}

const PLATFORM_MATCHERS: Record<Exclude<PlatformName, "unknown">, SignalMatcher[]> = {
    shopify: [
        {
            signal: "cdn.shopify.com",
            strength: "strong",
            regex: /cdn\.shopify\.com/i,
        },
        {
            signal: "myshopify.com",
            strength: "strong",
            regex: /myshopify\.com/i,
        },
        {
            signal: "window.Shopify",
            strength: "strong",
            regex: /window\s*\.\s*Shopify|Shopify\s*\.|ShopifyAnalytics/i,
        },
        {
            signal: "Shopify.shop",
            strength: "strong",
            regex: /Shopify\.shop|shopify\.shop/i,
        },
        {
            signal: "shopify-section",
            strength: "medium",
            regex: /shopify-section/i,
        },
        {
            signal: "Shopify asset URL",
            strength: "medium",
            regex: /shopify(?:[-_][A-Za-z0-9]+)?\.(?:js|css)|\/shopify\/|shopify\/assets/i,
        },
        {
            signal: "shopify products endpoint",
            strength: "medium",
            regex: /\/products\.json|products\.json/i,
        },
    ],
    woocommerce: [
        {
            signal: "woocommerce",
            strength: "strong",
            regex: /woocommerce/i,
        },
        {
            signal: "wp-json",
            strength: "strong",
            regex: /wp-json/i,
        },
        {
            signal: "wp-content",
            strength: "medium",
            regex: /wp-content/i,
        },
        {
            signal: "WooCommerce asset path",
            strength: "medium",
            regex: /woocommerce\/|wc-(?:order|cart|checkout)|add-to-cart/i,
        },
    ],
    magento: [
        {
            signal: "mage/",
            strength: "strong",
            regex: /(?:\/|\.)mage\//i,
        },
        {
            signal: "Magento storefront markers",
            strength: "strong",
            regex: /Magento|mage\/|Magento_Ui/i,
        },
        {
            signal: "Magento asset path",
            strength: "medium",
            regex: /magento|mage/i,
        },
    ],
    bigcommerce: [
        {
            signal: "bigcommerce",
            strength: "strong",
            regex: /bigcommerce/i,
        },
        {
            signal: "bc-app",
            strength: "medium",
            regex: /bc-app|bigcommerce\.com|bigcommerce\.store/i,
        },
        {
            signal: "BigCommerce asset marker",
            strength: "medium",
            regex: /bigcommerce.*(js|css)|\/bigcommerce\//i,
        },
    ],
    prestashop: [
        {
            signal: "prestashop",
            strength: "strong",
            regex: /prestashop/i,
        },
        {
            signal: "PrestaShop theme/assets",
            strength: "medium",
            regex: /prestashop.*(js|css)|themes\s*\/\s*prestashop|modules\s*\/\s*prestashop/i,
        },
        {
            signal: "ps_ marker",
            strength: "medium",
            regex: /ps_[A-Za-z0-9_-]+/i,
        },
    ],
    opencart: [
        {
            signal: "opencart",
            strength: "strong",
            regex: /opencart/i,
        },
        {
            signal: "OpenCart asset path",
            strength: "medium",
            regex: /catalog\/view\/theme|javascript\/opencart|opencart.*(js|css)/i,
        },
    ],
};

const WEIGHTS: Record<SignalStrength, number> = {
    strong: 3,
    medium: 2,
    weak: 1,
};

class PlatformDetectionService {
    detect(pages: ResearchPage[]): PlatformDetectionResult {
        const validPages = pages.filter(
            (page) => page.status === "found" && !!page.content
        );

        if (validPages.length === 0) {
            return this.unknownResult(
                "No found pages had content available for platform analysis."
            );
        }

        const scores = new Map<Exclude<PlatformName, "unknown">, number>();
        const evidenceByPlatform = new Map<
            Exclude<PlatformName, "unknown">,
            PlatformSignal[]
        >();
        const pagesByPlatform = new Map<
            Exclude<PlatformName, "unknown">,
            Set<string>
        >();

        for (const platform of Object.keys(PLATFORM_MATCHERS) as Exclude<
            PlatformName,
            "unknown"
        >[]) {
            scores.set(platform, 0);
            evidenceByPlatform.set(platform, []);
            pagesByPlatform.set(platform, new Set());
        }

        for (const page of validPages) {
            const content = page.content ?? "";
            const source = page.page_type ?? page.url ?? "page";

            for (const [platform, matchers] of Object.entries(
                PLATFORM_MATCHERS
            ) as [Exclude<PlatformName, "unknown">, SignalMatcher[]][]) {
                for (const matcher of matchers) {
                    if (!matcher.regex.test(content)) {
                        continue;
                    }

                    const currentSignals = evidenceByPlatform.get(platform) ?? [];
                    const duplicate = currentSignals.some(
                        (signal) =>
                            signal.signal === matcher.signal &&
                            signal.source === source
                    );

                    if (duplicate) {
                        continue;
                    }

                    const signal: PlatformSignal = {
                        signal: matcher.signal,
                        platform,
                        strength: matcher.strength,
                        source,
                    };

                    currentSignals.push(signal);
                    evidenceByPlatform.set(platform, currentSignals);
                    const pageSet = pagesByPlatform.get(platform) ?? new Set<string>();
                    pageSet.add(page.url ?? source);
                    pagesByPlatform.set(platform, pageSet);

                    const currentScore = scores.get(platform) ?? 0;
                    scores.set(platform, currentScore + WEIGHTS[matcher.strength]);
                }
            }
        }

        const rankedPlatforms = [...scores.entries()]
            .map(([platform, score]) => ({
                platform,
                score,
                signals: evidenceByPlatform.get(platform) ?? [],
                pages: [...(pagesByPlatform.get(platform) ?? new Set())],
            }))
            .sort((left, right) => right.score - left.score);

        const top = rankedPlatforms[0];

        if (!top || top.score < 3) {
            return this.unknownResult(
                "No platform reached the minimum evidence threshold."
            );
        }

        const second = rankedPlatforms[1];

        if (second && second.score >= top.score - 1) {
            return this.unknownResult(
                `Conflicting platform evidence: ${top.platform} and ${second.platform} are too close.`
            );
        }

        const confidence = this.normalizeConfidence(top.score, top.signals.length);

        return {
            platform: top.platform,
            confidence,
            evidence: {
                signals: top.signals,
                pages: top.pages,
                summary: `${top.platform} detected from ${top.signals.length} signal(s) across ${top.pages.length} page(s).`,
            },
        };
    }

    private normalizeConfidence(score: number, signalCount: number): number {
        const rawConfidence = 0.5 + (score / 18) + (signalCount / 30);
        return Math.min(0.98, Math.max(0.0, rawConfidence));
    }

    private unknownResult(summary: string): PlatformDetectionResult {
        return {
            platform: "unknown",
            confidence: 0,
            evidence: {
                signals: [],
                pages: [],
                summary,
            },
        };
    }
}

export const platformDetectionService = new PlatformDetectionService();
