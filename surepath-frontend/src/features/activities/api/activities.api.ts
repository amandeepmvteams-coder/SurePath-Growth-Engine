import { apiClient } from "@/lib/api/client";

import {
  merchantActivitiesSchema,
  merchantActivitySchema,
} from "../schemas/activity.schema";

import type {
  CreateMerchantActivityData,
  MerchantActivity,
} from "../types/activity.types";

export async function getMerchantActivities(
  merchantId: string
): Promise<MerchantActivity[]> {
  const response = await apiClient.get(
    `/api/v1/merchants/${merchantId}/activities`
  );

  return merchantActivitiesSchema.parse(response.data);
}

export async function createMerchantActivity(
  merchantId: string,
  data: CreateMerchantActivityData
): Promise<MerchantActivity> {
  const response = await apiClient.post(
    `/api/v1/merchants/${merchantId}/activities`,
    data
  );

  return merchantActivitySchema.parse(response.data);
}