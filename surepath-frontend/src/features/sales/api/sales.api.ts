import { getMerchants } from "@/features/merchants/api/merchants.api";
import { apiClient } from "@/lib/api/client";

import {
    salesTasksSchema,
    taskSummarySchema,
} from "../schemas/sales.schema";

import type {
    SalesTask,
    TaskSummary,
} from "../types/sales.types";

export async function getSalesTaskSummary(): Promise<TaskSummary> {
    const response = await apiClient.get(
        "/api/v1/tasks/summary"
    );

    return taskSummarySchema.parse(response.data);
}

export async function getSalesTasks(): Promise<SalesTask[]> {
    const response = await apiClient.get(
        "/api/v1/tasks"
    );

    return salesTasksSchema.parse(response.data);
}

export async function getSalesMerchants() {
    return getMerchants({
        limit: 100,
        offset: 0,
    });
}

export async function getSalesData() {
    const [taskSummary, tasks, merchantResponse] =
        await Promise.all([
            getSalesTaskSummary(),
            getSalesTasks(),
            getSalesMerchants(),
        ]);

    return {
        taskSummary,
        tasks,
        merchants: merchantResponse.data,
    };
}