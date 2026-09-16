export interface AIConfig {
    id: string;
    key: string;
    prompt_template: string;
    model: string;
    params: Record<string, unknown>;
    version: number;
    is_active: boolean;
}

export interface CreateAIConfigInput {
    key: string;
    prompt_template: string;
    model: string;
    params?: Record<string, unknown>;
}

export interface AIConfigResponse {
    id: string;
    key: string;
    prompt_template: string;
    model: string;
    params: Record<string, unknown>;
    version: number;
    is_active: boolean;
}