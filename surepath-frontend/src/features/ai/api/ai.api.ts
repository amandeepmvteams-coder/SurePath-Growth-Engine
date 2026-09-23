import { apiClient } from "@/lib/api/client";
import { aiRunResponseSchema } from "../schemas/ai.schema";
import type { AIRunRequest, AIRunResponse } from "../types/ai.types";

export async function runAI(
    payload: AIRunRequest
): Promise<AIRunResponse> {
    const response = await apiClient.post(
        "/api/v1/ai/run",
        payload
    );

    return aiRunResponseSchema.parse(response.data);
}