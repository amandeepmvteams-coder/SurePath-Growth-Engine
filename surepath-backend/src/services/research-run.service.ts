import { merchantRepository } from "../repositories/merchant.repository";
import { provenanceRepository } from "../repositories/merchant-provenance.repository";
import { researchRunRepository } from "../repositories/research.repository";
import { researchPageRepository } from "../repositories/research-run.repository";
import { provenanceService } from "./merchant-provenance.service";
import { platformDetectionService } from "./platform-detection.service";

interface PageDefinition {
    path: string;
    type: string;
}

interface FetchedPage {
    url: string;
    pageType: string;
    status: "found" | "missing" | "failed";
    statusCode: number | null;
    contentType: string | null;
    title: string | null;
    content: string | null;
    error: string | null;
}

const PAGE_DEFINITIONS: PageDefinition[] = [
    {
        path: "/",
        type: "homepage",
    },
    {
        path: "/products.json",
        type: "products_json",
    },
    {
        path: "/about",
        type: "about",
    },
    {
        path: "/contact",
        type: "contact",
    },
    {
        path: "/shipping",
        type: "shipping",
    },
    {
        path: "/returns",
        type: "returns",
    },
    {
        path: "/refund-policy",
        type: "refund",
    },
    {
        path: "/privacy-policy",
        type: "privacy",
    },
    {
        path: "/terms",
        type: "terms",
    },

];

const REQUEST_DELAY_MS = 1000;
const MAX_RETRIES = 2;

const WEBSITE_PROTECTED_ERROR =
    "Website protected by challenge. Skipping remaining page discovery.";

class ResearchService {
    private async delay(ms: number) {
        await new Promise((resolve) =>
            setTimeout(resolve, ms)
        );
    }

    private normalizeDomain(domain: string): string {
        let value = domain.trim();

        if (!value.startsWith("http://") &&
            !value.startsWith("https://")) {
            value = `https://${value}`;
        }

        return value.replace(/\/+$/, "");
    }

    private extractTitle(html: string): string | null {
        const match = html.match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
        );

        if (!match) {
            return null;
        }

        return match[1]
            .replace(/\s+/g, " ")
            .trim();
    }

    private async checkRobots(
        baseUrl: string
    ): Promise<boolean> {
        const robotsUrl = `${baseUrl}/robots.txt`;

        try {
            const response = await fetch(robotsUrl, {
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                return true;
            }

            const robotsText = await response.text();

            const lines = robotsText
                .split("\n")
                .map((line) => line.trim());

            let appliesToAll = false;
            let disallowAll = false;

            for (const line of lines) {
                if (
                    line.toLowerCase() === "user-agent: *"
                ) {
                    appliesToAll = true;
                }

                if (
                    appliesToAll &&
                    line.toLowerCase() === "disallow: /"
                ) {
                    disallowAll = true;
                }
            }

            return !disallowAll;
        } catch {
            return true;
        }
    }

    private async fetchWithRetry(
        url: string
    ): Promise<Response> {
        let lastError: unknown;

        for (
            let attempt = 0;
            attempt <= MAX_RETRIES;
            attempt++
        ) {
            try {
                console.log(
                    `[Research] Attempt ${attempt + 1}/${MAX_RETRIES + 1}: ${url}`
                );

                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "SurePathResearchBot/1.0",
                        Accept: "text/html,application/xhtml+xml",
                    },
                    redirect: "follow",
                    signal: AbortSignal.timeout(5000),
                });

                console.log(
                    `[Research] Response ${response.status}: ${url}`
                );

                return response;
            } catch (error) {
                lastError = error;

                console.log(
                    `[Research] Request failed: ${url}`,
                    error instanceof Error
                        ? error.message
                        : error
                );

                if (attempt < MAX_RETRIES) {
                    const backoff =
                        1000 * Math.pow(2, attempt);

                    console.log(
                        `[Research] Retrying in ${backoff}ms...`
                    );

                    await this.delay(backoff);
                }
            }
        }

        throw lastError;
    }
    private isChallengeResponse(response: Response): boolean {
        return (
            response.status === 429 &&
            response.headers.get("x-vercel-mitigated") === "challenge"
        );
    }
    private async fetchPage(
        url: string,
        pageType: string
    ): Promise<FetchedPage> {
        for (
            let attempt = 0;
            attempt <= MAX_RETRIES;
            attempt++
        ) {
            try {
                console.log(
                    `[Research] Attempt ${attempt + 1}/${MAX_RETRIES + 1}: ${url}`
                );

                const response = await fetch(url, {
                    method: "GET",
                    redirect: "follow",
                    headers: {
                        "User-Agent": "SurePathResearchBot/1.0",
                        Accept: "text/html,application/xhtml+xml",
                    },
                    signal: AbortSignal.timeout(5000),
                });

                console.log(
                    `[Research] Response ${response.status}: ${url}`
                );
               
                const contentType =
                    response.headers.get("content-type");

                // Page does not exist.
                if (response.status === 404 || response.status === 410) {
                    return {
                        url,
                        pageType,
                        status: "missing",
                        statusCode: response.status,
                        contentType,
                        title: null,
                        content: null,
                        error: `HTTP ${response.status}`,
                    };
                }

                // Rate limited by the merchant website.
                if (response.status === 429) {
                    if (this.isChallengeResponse(response)) {
                        return {
                            url,
                            pageType,
                            status: "failed",
                            statusCode: response.status,
                            contentType,
                            title: null,
                            content: null,
                            error: WEBSITE_PROTECTED_ERROR,
                        };
                    }

                    if (attempt < MAX_RETRIES) {
                        const retryAfter =
                            response.headers.get("retry-after");

                        const retryAfterSeconds = retryAfter
                            ? Number(retryAfter)
                            : NaN;

                        const backoff = Number.isFinite(
                            retryAfterSeconds
                        )
                            ? retryAfterSeconds * 1000
                            : 2000 * Math.pow(2, attempt);

                        console.log(
                            `[Research] Rate limited: ${url}. Retrying in ${backoff}ms...`
                        );

                        await this.delay(backoff);
                        continue;
                    }

                    return {
                        url,
                        pageType,
                        status: "failed",
                        statusCode: response.status,
                        contentType,
                        title: null,
                        content: null,
                        error: "HTTP 429 - Too Many Requests",
                    };
                }

                // Other HTTP errors should not be treated as missing pages.
                if (!response.ok) {
                    return {
                        url,
                        pageType,
                        status: "failed",
                        statusCode: response.status,
                        contentType,
                        title: null,
                        content: null,
                        error: `HTTP ${response.status}`,
                    };
                }

                const content = await response.text();

                const title = this.extractTitle(content);

                return {
                    url,
                    pageType,
                    status: "found",
                    statusCode: response.status,
                    contentType,
                    title,
                    content,
                    error: null,
                };
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown request error";

                console.log(
                    `[Research] Request failed: ${url}`,
                    message
                );

                if (attempt < MAX_RETRIES) {
                    const backoff =
                        1000 * Math.pow(2, attempt);

                    console.log(
                        `[Research] Retrying in ${backoff}ms...`
                    );

                    await this.delay(backoff);

                    continue;
                }

                return {
                    url,
                    pageType,
                    status: "failed",
                    statusCode: null,
                    contentType: null,
                    title: null,
                    content: null,
                    error: message,
                };
            }
        }

        return {
            url,
            pageType,
            status: "failed",
            statusCode: null,
            contentType: null,
            title: null,
            content: null,
            error: "Request failed",
        };
    }



    async researchMerchant(
        merchantId: string
    ) {
        console.log(
            `[Research] Starting research for merchant: ${merchantId}`
        );



        const merchant =
            await merchantRepository.findById(
                merchantId
            );

        if (!merchant) {
            throw new Error("MERCHANT_NOT_FOUND");
        }

        const researchRun =
            await researchRunRepository.create(
                merchantId
            );

        try {
            const baseUrl =
                this.normalizeDomain(merchant.domain);


            console.log(
                `[Research] Base URL: ${baseUrl}`
            );

            const robotsAllowed =
                await this.checkRobots(baseUrl);

            console.log(
                `[Research] Checking robots.txt...`
            );

            console.log(
                `[Research] robots.txt allowed: ${robotsAllowed}`
            );

            if (!robotsAllowed) {
                await researchRunRepository.markFailed(
                    researchRun.id,
                    "Research blocked by robots.txt"
                );

                throw new Error(
                    "RESEARCH_BLOCKED_BY_ROBOTS"
                );
            }

            let pagesFound = 0;
            let pagesMissing = 0;
            let pagesFailed = 0;

            // Discover useful internal pages from the homepage
            const homepageUrl = `${baseUrl}/`;

            console.log(
                `[Research] Discovering internal pages from homepage...`
            );

            const homepageResult = await this.fetchPage(
                homepageUrl,
                "homepage"
            );
            if (
                homepageResult.status === "failed" &&
                homepageResult.error === WEBSITE_PROTECTED_ERROR
            ) {
                console.log(
                    `[Research] Website protected by challenge. Skipping remaining page discovery.`
                );

                await researchPageRepository.create({
                    research_run_id: researchRun.id,
                    merchant_id: merchantId,
                    url: homepageResult.url,
                    page_type: homepageResult.pageType,
                    status: homepageResult.status,
                    status_code: homepageResult.statusCode,
                    content_type: homepageResult.contentType,
                    title: homepageResult.title,
                    content: homepageResult.content,
                    error: homepageResult.error,
                });

                await researchRunRepository.markFailed(
                    researchRun.id,
                    WEBSITE_PROTECTED_ERROR
                );

                throw new Error(
                    WEBSITE_PROTECTED_ERROR
                );
            }


            const discoveredPages: Array<{
                type: string;
                url: string;
            }> = [];

            if (
                homepageResult.status === "found" &&
                homepageResult.content
            ) {
                const internalLinks = this.extractInternalLinks(
                    homepageResult.content,
                    baseUrl
                );

                const discoveredKeys = new Set<string>();

                for (const url of internalLinks) {
                    const type = this.classifyDiscoveredPage(url);

                    if (!type) {
                        continue;
                    }

                    const key = `${type}:${url}`;

                    if (discoveredKeys.has(key)) {
                        continue;
                    }

                    discoveredKeys.add(key);

                    discoveredPages.push({
                        type,
                        url,
                    });
                }

                console.log(
                    `[Research] Discovered internal pages:`,
                    discoveredPages
                );

                console.log(
                    `[Research] Discovered ${discoveredPages.length} useful internal pages`
                );
            } else {
                console.log(
                    `[Research] Could not discover internal pages because homepage was not found`
                );
            }

            const pagesToFetch: Array<{
                type: string;
                url: string;
            }> = [];

            const queuedUrls = new Set<string>();

            const discoveredByType = new Map<string, string>();

            for (const page of discoveredPages) {
                if (!discoveredByType.has(page.type)) {
                    discoveredByType.set(page.type, page.url);
                }
            }

            // A refund policy can also serve as the returns policy source.
            if (
                !discoveredByType.has("returns") &&
                discoveredByType.has("refund")
            ) {
                discoveredByType.set(
                    "returns",
                    discoveredByType.get("refund")!
                );
            }

            for (const page of PAGE_DEFINITIONS) {
                const discoveredUrl = discoveredByType.get(page.type);

                const url = discoveredUrl
                    ? discoveredUrl
                    : `${baseUrl}${page.path}`;

                if (queuedUrls.has(url)) {
                    continue;
                }

                queuedUrls.add(url);

                pagesToFetch.push({
                    type: page.type,
                    url,
                });
            }

            console.log(
                `[Research] Total pages queued: ${pagesToFetch.length}`
            );

            for (const page of pagesToFetch) {
                console.log(
                    `[Research] Fetching: ${page.type} -> ${page.url}`
                );

                const url = page.url;

                const result = await this.fetchPage(
                    url,
                    page.type
                );
                console.log(
                    `[Research] Finished: ${page.type} -> ${result.status}`
                );

                await researchPageRepository.create({
                    research_run_id:
                        researchRun.id,
                    merchant_id: merchantId,
                    url: result.url,
                    page_type: result.pageType,
                    status: result.status,
                    status_code:
                        result.statusCode,
                    content_type:
                        result.contentType,
                    title: result.title,
                    content: result.content,
                    error: result.error,
                });

                if (result.status === "found") {
                    pagesFound++;
                } else if (result.status === "missing") {
                    pagesMissing++;
                } else if (result.status === "failed") {
                    pagesFailed++;
                }

                await this.delay(
                    REQUEST_DELAY_MS
                );
            }
            if (pagesFound === 0 && pagesFailed > 0) {
                await researchRunRepository.markFailed(
                    researchRun.id,
                    "Merchant website could not be reached"
                );

                throw new Error(
                    "Merchant website could not be reached"
                );
            }

            const researchPages =
                await researchPageRepository.findByRunId(
                    researchRun.id
                );

            const platformResult =
                platformDetectionService.detect(
                    researchPages
                );

            const currentPlatformProvenance =
                await provenanceRepository.findCurrentByField(
                    merchantId,
                    "platform"
                );

            if (
                !currentPlatformProvenance ||
                !currentPlatformProvenance.is_manual_override
            ) {
                const platformValue =
                    platformResult.platform === "unknown"
                        ? null
                        : platformResult.platform;

                await merchantRepository.update(
                    merchantId,
                    {
                        platform: platformValue,
                    }
                );

                await provenanceService.recordProvenance({
                    merchant_id: merchantId,
                    field_key: "platform",
                    value:
                        platformResult.platform === "unknown"
                            ? "unknown"
                            : platformResult.platform,
                    source: "research",
                    confidence: Number(
                        platformResult.confidence.toFixed(4)
                    ),
                    evidence: platformResult.evidence,
                    verified_at: new Date(),
                    is_manual_override: false,
                });
            }

            await researchRunRepository.markCompleted(
                researchRun.id
            );

            return {
                merchant_id: merchantId,
                research_run_id: researchRun.id,
                pages_found: pagesFound,
                pages_missing: pagesMissing,
            };
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "RESEARCH_BLOCKED_BY_ROBOTS"
            ) {
                throw error;
            }

            await researchRunRepository.markFailed(
                researchRun.id,
                error instanceof Error
                    ? error.message
                    : "Research failed"
            );

            throw error;
        }
    }
    private extractInternalLinks(
        html: string,
        baseUrl: string
    ): string[] {
        const links = new Set<string>();

        const base = new URL(baseUrl);

        const hrefRegex =
            /<a\b[^>]*href=["']([^"']+)["']/gi;

        let match: RegExpExecArray | null;

        while ((match = hrefRegex.exec(html)) !== null) {
            const href = match[1].trim();

            if (!href || href.startsWith("#")) {
                continue;
            }

            if (
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                href.startsWith("javascript:")
            ) {
                continue;
            }

            try {
                const url = new URL(href, baseUrl);

                if (url.hostname !== base.hostname) {
                    continue;
                }

                url.hash = "";

                links.add(url.toString());
            } catch {
                continue;
            }
        }

        return [...links];
    }

    private classifyDiscoveredPage(
        url: string
    ): string | null {
        const pathname =
            new URL(url).pathname.toLowerCase();

        if (
            pathname.includes("/about") ||
            pathname.includes("/pages/about") ||
            pathname.includes("/pages/about-us") ||
            pathname.includes("/about-us")
        ) {
            return "about";
        }

        if (
            pathname.includes("/contact") ||
            pathname.includes("/pages/contact") ||
            pathname.includes("/pages/contact-us") ||
            pathname.includes("/contact-us")
        ) {
            return "contact";
        }

        if (
            pathname.includes("/shipping") ||
            pathname.includes("shipping-policy") ||
            pathname.includes("shipping-information") ||
            pathname.includes("delivery-policy") ||
            pathname.includes("delivery-information")
        ) {
            return "shipping";
        }

        if (pathname.includes("refund")) {
            return "refund";
        }

        if (pathname.includes("return")) {
            return "returns";
        }

        if (pathname.includes("privacy")) {
            return "privacy";
        }

        if (
            pathname.includes("terms") ||
            pathname.includes("conditions")
        ) {
            return "terms";
        }

        return null;
    }
}

export const researchService =
    new ResearchService();