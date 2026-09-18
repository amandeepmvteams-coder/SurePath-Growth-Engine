import { apiClient } from "@/lib/api/client";

import {
    merchantScoresSchema,
} from "../schemas/scoring.schema";

import type { MerchantScore } from "../types/scoring.types";

export async function getMerchantScores(
    merchantId: string
): Promise<MerchantScore[]> {
    const response = await apiClient.get(
        `/api/v1/merchants/${merchantId}/scores`
    );

    return merchantScoresSchema.parse(response.data);
}