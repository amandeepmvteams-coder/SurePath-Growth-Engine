import { merchantRepository } from "../repositories/merchant.repository";
import { industryRepository } from "../repositories/industry.repository";
import { aiRunRepository } from "../repositories/ai-run.repository";
import { merchantProfileRepository } from "../repositories/merchant-profile.repository";
import { aiConfigService } from "./ai-config.service";
import { aiProviderService } from "./ai-provider.service";

import {
    AIRunRequest,
    AIRunResult,
    AIRunTask,
} from "../types/ai-run.types";

import {
    AIProviderResponse,
} from "../types/ai-provider.types";


class AIRunService {

    async run(
        data: AIRunRequest
    ): Promise<AIRunResult> {

        const merchantIds =
            await this.resolveMerchantIds(data);

        const result: AIRunResult = {
            classified: 0,
            summarised: 0,
            policies_summarised: 0,
            skipped_unchanged: 0,
            rejected: 0,
            errors: [],
            per_task: {},
        };

        if (merchantIds.length === 0) {
            return result;
        }

        const tasks: AIRunTask[] =
            data.tasks && data.tasks.length > 0
                ? [...new Set(data.tasks)]
                : [
                    "industry_classify",
                    "research_summary",
                    "policy_summary",
                ];

        /*
         * Load active AI configurations.
         */
        const configs =
            await aiConfigService.getConfigs();

        const configMap =
            new Map(
                configs.map((config) => [
                    config.key,
                    config,
                ])
            );
        console.log(
            "ACTIVE AI CONFIGS:",
            configs.map((config) => ({
                key: config.key,
                model: config.model,
                version: config.version,
            }))
        );
        /*
         * Load approved SurePath industries.
         */
        const industries =
            await industryRepository.findAllActive();

        const approvedIndustries =
            industries.map(
                (industry) => industry.name
            );

        /*
         * Load merchant/profile data.
         */
        const merchants =
            await aiRunRepository.findMerchantsData(
                merchantIds
            );

        /*
         * Process each merchant.
         */
        for (const merchant of merchants) {

            for (const task of tasks) {

                const prepared =
                    this.prepareTaskInput(
                        task,
                        merchant,
                        approvedIndustries,
                        configMap
                    );

                if (!prepared) {

                    result.errors.push(
                        `AI configuration missing for task: ${task}`
                    );

                    this.recordTaskResult(
                        result,
                        task,
                        {
                            status: "configuration_missing",
                            merchants: 1,
                        }
                    );

                    continue;
                }

                try {

                    const providerResult =
                        await aiProviderService.run({
                            task,
                            config: prepared.config,
                            input: prepared.input,
                        });

                    console.log("[AI] Provider result:", {
                        task,
                        result: providerResult,
                    });

                    await this.handleProviderResult(
                        result,
                        merchant.merchant_id,
                        providerResult,
                        approvedIndustries
                    );

                } catch (error) {

                    if (
                        error instanceof Error &&
                        error.message ===
                        "AI_PROVIDER_NOT_CONFIGURED"
                    ) {

                        this.recordTaskResult(
                            result,
                            task,
                            {
                                status:
                                    "provider_not_configured",
                                merchants: merchantIds.length,
                                config_version:
                                    prepared.config.version,
                            }
                        );

                        continue;
                    }

                    console.error(
                        `AI task failed: ${task}`,
                        error
                    );

                    result.errors.push(
                        `AI task failed for ${task}`
                    );

                    this.recordTaskResult(
                        result,
                        task,
                        {
                            status: "error",
                            merchants: 1,
                            config_version:
                                prepared.config.version,
                        }
                    );
                }
            }
        }

        /*
         * Keep the contract's provider-not-configured
         * error exactly as before.
         */
        const providerMissing =
            Object.values(result.per_task)
                .some(
                    (taskResult: any) =>
                        taskResult.status ===
                        "provider_not_configured"
                );

        if (providerMissing) {

            result.errors.push(
                "AI provider is not configured. AI processing was not executed."
            );
        }

        return result;
    }


    private prepareTaskInput(
        task: AIRunTask,
        merchant: any,
        approvedIndustries: string[],
        configMap: Map<string, any>
    ) {

        const configKeyByTask: Record<AIRunTask, string> = {
            industry_classify: "industry_classify",
            research_summary: "research_summary",
            policy_summary: "policy_summary",
        };

        const config = configMap.get(configKeyByTask[task]);

        if (!config) {
            return null;
        }

        switch (task) {

            case "industry_classify":

                return {
                    config,

                    input: {
                        merchant: {
                            merchant_id:
                                merchant.merchant_id,

                            company_name:
                                merchant.company_name ?? null,

                            store_name:
                                merchant.store_name ?? null,

                            domain:
                                merchant.domain ?? null,

                            platform:
                                merchant.platform ?? null,

                            country:
                                merchant.country ?? null,

                            description:
                                merchant.description ?? null,

                            current_industry:
                                merchant.industry ?? null,
                            research_summary:
                                merchant.research_summary ?? null,
                        },

                        approved_industries:
                            approvedIndustries,
                    },
                };


            case "research_summary":

                return {
                    config,

                    input: {
                        merchant: {
                            merchant_id:
                                merchant.merchant_id,

                            company_name:
                                merchant.company_name ?? null,

                            domain:
                                merchant.domain ?? null,

                            description:
                                merchant.description ?? null,

                            research_summary:
                                merchant.research_summary ?? null,

                            contact_email:
                                merchant.contact_email ?? null,

                            contact_phone:
                                merchant.contact_phone ?? null,
                        },
                    },
                };


            case "policy_summary":

                return {
                    config,

                    input: {
                        merchant: {
                            merchant_id:
                                merchant.merchant_id,

                            company_name:
                                merchant.company_name ?? null,

                            domain:
                                merchant.domain ?? null,

                            description:
                                this.truncateText(
                                    merchant.description,
                                    2000
                                ),

                            research_summary:
                                merchant.research_summary ?? null,

                            shipping_policy:
                                this.truncateText(
                                    merchant.shipping_policy,
                                    6000
                                ),

                            return_policy:
                                this.truncateText(
                                    merchant.return_policy,
                                    6000
                                ),

                            existing_shipping_summary:
                                merchant.shipping_policy_summary ?? null,

                            existing_return_summary:
                                merchant.return_policy_summary ?? null,
                        },
                    },
                };


            default:
                return null;
        }
    }


    private async handleProviderResult(
        result: AIRunResult,
        merchantId: string,
        providerResult: AIProviderResponse,
        approvedIndustries: string[]
    ): Promise<void> {

        if (providerResult.status === "rejected") {

            result.rejected++;

            this.recordTaskResult(
                result,
                providerResult.task,
                {
                    status: "rejected",
                    merchants: 1,
                    reason:
                        providerResult.reason ?? null,
                }
            );

            return;
        }


        /*
         * Industry classification
         */
        if (
            providerResult.task ===
            "industry_classify"
        ) {

            const industry =
                providerResult.industry?.trim();

            if (!industry) {

                result.rejected++;

                this.recordTaskResult(
                    result,
                    providerResult.task,
                    {
                        status: "rejected",
                        merchants: 1,
                        reason:
                            "AI did not return an industry",
                    }
                );

                return;
            }

            /*
             * AI must use the approved taxonomy.
             */
            if (
                !approvedIndustries.includes(
                    industry
                )
            ) {

                result.rejected++;

                this.recordTaskResult(
                    result,
                    providerResult.task,
                    {
                        status: "rejected",
                        merchants: 1,
                        reason:
                            "AI returned an industry outside the approved taxonomy",
                    }
                );

                return;
            }

            /*
             * Persist classification.
             */
            await merchantRepository.update(
                merchantId,
                {
                    industry,
                } as any
            );

            result.classified++;

            this.recordTaskResult(
                result,
                providerResult.task,
                {
                    status: "completed",
                    merchants: 1,
                }
            );

            return;
        }


        /*
         * Research summary
         */
        if (
            providerResult.task ===
            "research_summary"
        ) {

            const summary =
                providerResult.research_summary
                    ?.trim();

            if (!summary) {

                result.rejected++;

                this.recordTaskResult(
                    result,
                    providerResult.task,
                    {
                        status: "rejected",
                        merchants: 1,
                        reason:
                            "AI did not return a research summary",
                    }
                );

                return;
            }

            await merchantProfileRepository.update(
                merchantId,
                {
                    research_summary:
                        summary,
                } as any
            );

            result.summarised++;

            this.recordTaskResult(
                result,
                providerResult.task,
                {
                    status: "completed",
                    merchants: 1,
                }
            );

            return;
        }


        /*
         * Policy summaries
         */
        if (
            providerResult.task ===
            "policy_summary"
        ) {

            const shippingSummary =
                providerResult
                    .shipping_policy_summary
                    ?.trim();

            const returnSummary =
                providerResult
                    .return_policy_summary
                    ?.trim();

            if (
                !shippingSummary &&
                !returnSummary
            ) {

                result.rejected++;

                this.recordTaskResult(
                    result,
                    providerResult.task,
                    {
                        status: "rejected",
                        merchants: 1,
                        reason:
                            "AI did not return policy summaries",
                    }
                );

                return;
            }

            await merchantProfileRepository.update(
                merchantId,
                {
                    shipping_policy_summary:
                        shippingSummary ?? null,

                    return_policy_summary:
                        returnSummary ?? null,
                } as any
            );

            result.policies_summarised++;

            this.recordTaskResult(
                result,
                providerResult.task,
                {
                    status: "completed",
                    merchants: 1,
                }
            );

            return;
        }
    }

    private truncateText(
        value: string | null | undefined,
        maxLength: number
    ): string | null {
        if (!value) {
            return null;
        }

        if (value.length <= maxLength) {
            return value;
        }

        return `${value.slice(0, maxLength)}\n[Content truncated]`;
    }

    private recordTaskResult(
        result: AIRunResult,
        task: AIRunTask,
        value: Record<string, unknown>
    ): void {

        const existing =
            result.per_task[task];

        if (!existing) {

            result.per_task[task] = {
                ...value,
            };

            return;
        }

        /*
         * Aggregate merchant counts rather than
         * overwriting the task result.
         */
        const existingValue =
            existing as Record<string, any>;

        const existingMerchants =
            Number(
                existingValue.merchants ?? 0
            );

        const newMerchants =
            Number(
                value.merchants ?? 0
            );

        result.per_task[task] = {
            ...existingValue,
            ...value,
            merchants:
                existingMerchants +
                newMerchants,
        };
    }


    private async resolveMerchantIds(
        data: AIRunRequest
    ): Promise<string[]> {

        /*
         * Individual merchant
         */
        if (data.merchant_id) {

            const merchant =
                await merchantRepository.findById(
                    data.merchant_id
                );

            if (!merchant) {

                throw new Error(
                    "MERCHANT_NOT_FOUND"
                );
            }

            return [merchant.id];
        }


        /*
         * Multiple merchants
         */
        if (
            data.merchant_ids &&
            data.merchant_ids.length > 0
        ) {

            const uniqueIds = [
                ...new Set(
                    data.merchant_ids
                ),
            ];

            const merchants =
                await aiRunRepository
                    .findMerchantsData(
                        uniqueIds
                    );

            return merchants.map(
                (merchant) =>
                    merchant.merchant_id
            );
        }


        /*
         * Batch
         *
         * Uses the existing profile-run merchant
         * selection mechanism.
         */
        if (data.limit) {

            const merchants =
                await merchantRepository
                    .findForProfileRun(
                        data.limit
                    );

            return merchants.map(
                (merchant) =>
                    merchant.id
            );
        }


        throw new Error(
            "AI_RUN_INPUT_REQUIRED"
        );
    }
}


export const aiRunService =
    new AIRunService();