import { withTransaction } from "../config/database";
import {
    aiConfigRepository,
} from "../repositories/ai-config.repository";

import {
    AIConfig,
    CreateAIConfigInput,
} from "../types/ai-config.types";

class AIConfigService {

    async getConfigs(): Promise<AIConfig[]> {
        let configs = await aiConfigRepository.findActiveConfigs();

        if (configs.length === 0) {
            const defaults: CreateAIConfigInput[] = [
                {
                    key: "industry_classify",
                    prompt_template: "Classify the merchant into one supported industry.",
                    model: "openai/gpt-oss-20b",
                    params: { temperature: 0 }
                },
                {
                    key: "research_summary",
                    prompt_template: "Write a concise research summary using collected merchant facts only.",
                    model: "openai/gpt-oss-20b",
                    params: { temperature: 0.2 }
                },
                {
                    key: "policy_summary",
                    prompt_template: "Summarize shipping and return policy using collected merchant data only.",
                    model: "openai/gpt-oss-20b",
                    params: { temperature: 0 }
                }
            ];

            for (const config of defaults) {
                await this.updateConfig(config);
            }

            configs = await aiConfigRepository.findActiveConfigs();
        }

        return configs;
    }

    async updateConfig(
        input: CreateAIConfigInput
    ): Promise<AIConfig> {

        return withTransaction(
            async (client) => {

                const version =
                    await aiConfigRepository.getNextVersion(
                        input.key,
                        client
                    );

                await aiConfigRepository.deactivateByKey(
                    input.key,
                    client
                );

                return aiConfigRepository.createVersion(
                    input,
                    version,
                    client
                );
            }
        );
    }
}

export const aiConfigService =
    new AIConfigService();