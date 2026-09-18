import { apiClient } from "@/lib/api/client";
import { merchantDetectionsSchema } from "../schemas/detection.schema";
import type { MerchantDetection } from "../types/detection.types";

export async function getMerchantDetections(
    merchantId: string
): Promise<MerchantDetection[]> {
    const response = await apiClient.get(
        `/api/v1/merchants/${merchantId}/detections`
    );
    
    return merchantDetectionsSchema.parse(response.data);
}