import { apiClient } from "@/lib/api/client";
import {
    merchantProfileSchema,
    updateMerchantProfileSchema,
} from "../schemas/profile.schema";
import type { MerchantProfile } from "../types/profile.types";

export async function getMerchantProfile(
    merchantId: string
): Promise<MerchantProfile | null> {
    const response = await apiClient.get(
        `/api/v1/merchants/${merchantId}/profile`
    );

    if (response.data === null) {
        return null;
    }

    return merchantProfileSchema.parse(response.data);
}

export async function updateMerchantProfile(
    merchantId: string,
    data: Partial<
        Pick<
            MerchantProfile,
            | "estimated_monthly_orders"
            | "avg_order_value"
            | "shipping_policy_summary"
            | "return_policy_summary"
            | "research_summary"
        >
    >
): Promise<MerchantProfile> {
    const validatedData =
        updateMerchantProfileSchema.parse(data);

    const response = await apiClient.patch(
        `/api/v1/merchants/${merchantId}/profile`,
        validatedData
    );

    return merchantProfileSchema.parse(response.data);
}