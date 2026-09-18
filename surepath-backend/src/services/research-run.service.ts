import { merchantRepository } from "../repositories/merchant.repository";
import { researchRunRepository } from "../repositories/research.repository";
import { researchPageRepository } from "../repositories/research-run.repository";

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

                // HTTP error = page missing
                if (!response.ok) {
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

                // Network / timeout failure
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

            for (const page of PAGE_DEFINITIONS) {
                console.log(
                    `[Research] Fetching: ${page.type} -> ${page.path}`
                );
                const url = `${baseUrl}${page.path}`;

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
}

export const researchService =
    new ResearchService();