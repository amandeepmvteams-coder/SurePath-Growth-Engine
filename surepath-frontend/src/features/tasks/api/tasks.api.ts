import { apiClient } from "@/lib/api/client";

import {
  merchantTaskSchema,
  merchantTasksSchema,
} from "../schemas/task.schema";

import type {
  CreateMerchantTaskData,
  MerchantTask,
  UpdateMerchantTaskData,
} from "../types/task.types";

export async function getMerchantTasks(
  merchantId: string
): Promise<MerchantTask[]> {
  const response = await apiClient.get(
    `/api/v1/merchants/${merchantId}/tasks`
  );

  return merchantTasksSchema.parse(response.data);
}

export async function createMerchantTask(
  merchantId: string,
  data: CreateMerchantTaskData
): Promise<MerchantTask> {
  const response = await apiClient.post(
    `/api/v1/merchants/${merchantId}/tasks`,
    data
  );

  return merchantTaskSchema.parse(response.data);
}

export async function updateMerchantTask(
  merchantId: string,
  taskId: string,
  data: UpdateMerchantTaskData
): Promise<MerchantTask> {
  const response = await apiClient.patch(
    `/api/v1/merchants/${merchantId}/tasks/${taskId}`,
    data
  );

  return merchantTaskSchema.parse(response.data);
}

export async function deleteMerchantTask(
  merchantId: string,
  taskId: string
): Promise<void> {
  await apiClient.delete(
    `/api/v1/merchants/${merchantId}/tasks/${taskId}`
  );
}