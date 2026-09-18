import { apiClient } from "@/lib/api/client";
import {
    merchantStatusHistoriesSchema,
} from "../schemas/status-history.schema";
import type {
    MerchantStatusHistory,
} from "../types/status-history.types";

export async function getMerchantStatusHistory(
    merchantId: string
): Promise<MerchantStatusHistory[]> {
    const response = await apiClient.get(
        `/api/v1/merchants/${merchantId}/status-history`
    );

    return merchantStatusHistoriesSchema.parse(response.data);
}