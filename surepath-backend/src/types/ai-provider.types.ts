import { AIRunTask } from "./ai-run.types";

export interface AIProviderRequest {
    task: AIRunTask;

    config: {
        key: string;
        prompt_template: string;
        model: string;
        params: Record<string, unknown>;
        version: number;
    };

    input: Record<string, unknown>;
}

export interface AIProviderResponse {
    task: AIRunTask;

    status: "completed" | "rejected";

    industry?: string | null;

    research_summary?: string | null;

    shipping_policy_summary?: string | null;

    return_policy_summary?: string | null;

    reason?: string | null;
}