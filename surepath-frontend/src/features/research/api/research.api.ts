import { apiClient } from "@/lib/api/client";
import { researchRunsSchema } from "../schemas/research.schema";
import type { ResearchRun } from "../types/research.types";

export async function getMerchantResearch(
    merchantId: string
): Promise<ResearchRun[]> {
    const response = await apiClient.get(
        `/api/v1/merchants/${merchantId}/research-runs`
    );

    return researchRunsSchema.parse(response.data);
}