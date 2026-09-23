import Groq from "groq-sdk";

import {
    AIProviderRequest,
    AIProviderResponse,
} from "../types/ai-provider.types";

class AIProviderService {

    private client: Groq | null = null;

    constructor() {
        const apiKey =
            process.env.GROQ_API_KEY;

        if (apiKey) {
            this.client = new Groq({
                apiKey,
            });
        }
    }

    async run(
        request: AIProviderRequest
    ): Promise<AIProviderResponse> {

        if (!this.client) {
            throw new Error(
                "AI_PROVIDER_NOT_CONFIGURED"
            );
        }

        const systemPrompt =
            this.buildSystemPrompt(request);

        const userInput =
            JSON.stringify(
                request.input,
                null,
                2
            );

        const response =
            await this.client.chat.completions.create(
                {
                    model:
                        request.config.model,

                    messages: [
                        {
                            role: "system",
                            content:
                                systemPrompt,
                        },
                        {
                            role: "user",
                            content:
                                userInput,
                        },
                    ],

                    temperature:
                        this.getTemperature(
                            request.config.params
                        ),

                    response_format: {
                        type: "json_object",
                    },
                }
            );

        const content =
            response.choices[0]
                ?.message
                ?.content;

        if (!content) {
            throw new Error(
                "AI_EMPTY_RESPONSE"
            );
        }

        return this.parseResponse(
            request.task,
            content
        );
    }


    private buildSystemPrompt(
        request: AIProviderRequest
    ): string {

        const basePrompt =
            request.config.prompt_template;

        if (
            request.task ===
            "industry_classify"
        ) {

            return `
${basePrompt}

You are performing the SurePath merchant industry classification task.

Rules:
1. Use ONLY one industry from the supplied approved_industries list.
2. Do not create a new industry.
3. Do not modify an industry name.
4. If the available information is insufficient, return status "rejected".
5. Return valid JSON only.

Required JSON format:
{
  "status": "completed",
  "industry": "Exact Approved Industry Name"
}

If insufficient information:
{
  "status": "rejected",
  "reason": "Insufficient information"
}
            `.trim();
        }


        if (
            request.task ===
            "research_summary"
        ) {

            return `
${basePrompt}

You are performing the SurePath merchant research summary task.

Rules:
1. Use ONLY information supplied in the input.
2. Do not invent facts.
3. Do not infer unsupported business information.
4. Keep the summary concise.
5. If there is insufficient information, reject the task.
6. Return valid JSON only.

Required JSON format:
{
  "status": "completed",
  "research_summary": "..."
}

If insufficient information:
{
  "status": "rejected",
  "reason": "Insufficient information"
}
            `.trim();
        }


        if (
            request.task ===
            "policy_summary"
        ) {

            return `
${basePrompt}

You are performing the SurePath merchant policy summary task.

Rules:
1. Use ONLY information supplied in the merchant input.
2. Shipping and return information may appear in:
   - shipping_policy
   - return_policy
   - description
   - research_summary
3. Do not invent policy details.
4. Do not assume policies that are not explicitly supported by the supplied information.
5. Summarize shipping and return policies separately.
6. Only produce a shipping summary when the supplied information supports it.
7. Only produce a return summary when the supplied information supports it.
8. If neither shipping nor return information is sufficiently supported, reject the task.
9. Return valid JSON only.

Required JSON format:
{
  "status": "completed",
  "shipping_policy_summary": "...",
  "return_policy_summary": "..."
}

If insufficient information:
{
  "status": "rejected",
  "reason": "Insufficient policy information"
}
`.trim();
        }


        return basePrompt;
    }


    private getTemperature(
        params: Record<string, unknown>
    ): number {

        const temperature =
            params.temperature;

        if (
            typeof temperature ===
            "number"
        ) {
            return temperature;
        }

        return 0;
    }


    private parseResponse(
        task: AIProviderRequest["task"],
        content: string
    ): AIProviderResponse {

        let parsed: any;

        try {
            parsed =
                JSON.parse(content);
        } catch {
            throw new Error(
                "AI_INVALID_JSON_RESPONSE"
            );
        }


        if (
            parsed.status !==
            "completed" &&
            parsed.status !==
            "rejected"
        ) {

            throw new Error(
                "AI_INVALID_STATUS"
            );
        }


        if (
            parsed.status ===
            "rejected"
        ) {

            return {
                task,
                status: "rejected",
                reason:
                    typeof parsed.reason ===
                        "string"
                        ? parsed.reason
                        : "AI rejected the task",
            };
        }


        if (
            task ===
            "industry_classify"
        ) {

            return {
                task,
                status: "completed",
                industry:
                    typeof parsed.industry ===
                        "string"
                        ? parsed.industry
                        : null,
            };
        }


        if (
            task ===
            "research_summary"
        ) {

            return {
                task,
                status: "completed",
                research_summary:
                    typeof parsed.research_summary ===
                        "string"
                        ? parsed.research_summary
                        : null,
            };
        }


        if (
            task ===
            "policy_summary"
        ) {

            return {
                task,
                status: "completed",

                shipping_policy_summary:
                    typeof parsed.shipping_policy_summary ===
                        "string"
                        ? parsed.shipping_policy_summary
                        : null,

                return_policy_summary:
                    typeof parsed.return_policy_summary ===
                        "string"
                        ? parsed.return_policy_summary
                        : null,
            };
        }


        throw new Error(
            "AI_UNSUPPORTED_TASK"
        );
    }
}

export const aiProviderService =
    new AIProviderService();