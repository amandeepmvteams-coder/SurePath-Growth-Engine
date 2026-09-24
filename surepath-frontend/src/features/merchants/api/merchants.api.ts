import { apiClient } from "@/lib/api/client";

import {
    getMerchantsResponseSchema,
    createMerchantSchema,
    merchantSchema,
} from "../schemas/merchant.schema";
import { z } from "zod";
import type {
    GetMerchantsParams,
    GetMerchantsResponse,
    Merchant,
} from "../types/merchant.types";

export async function getMerchants(
    params?: GetMerchantsParams
): Promise<GetMerchantsResponse> {
    const response = await apiClient.get("/api/v1/merchants", {
        params,
    });

    return getMerchantsResponseSchema.parse(response.data);
}

export async function createMerchant(data: {
    domain: string;
    store_name: string;
    country?: string;
    industry?: string;
    source?: string;
}): Promise<Omit<Merchant, "assigned_rep">> {
    const response = await apiClient.post("/api/v1/merchants", data);

    return createMerchantSchema.parse(response.data.data);
}

export async function deleteMerchant(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/merchants/${id}`);
}

export async function exportMerchants(): Promise<Blob> {
    const response = await apiClient.get("/api/v1/merchants/export", {
        responseType: "blob",
    });

    return response.data;
}

export async function getMerchantById(id: string): Promise<Merchant> {
    const response = await apiClient.get(`/api/v1/merchants/${id}`);

    return merchantSchema.parse(response.data.data);
}

export async function updateMerchant(
    id: string,
    data: Partial<{
        store_name: string | null;
        country: string | null;
        industry: string | null;
        status: string;
        assigned_rep_id: string | null;
        next_follow_up_at: string | null;
    }>
): Promise<Merchant> {
    const response = await apiClient.patch(
        `/api/v1/merchants/${id}`,
        data
    );
    return merchantSchema.parse(response.data.data);
}