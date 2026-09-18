import { apiClient } from "@/lib/api/client";
import {
    merchantContactSchema,
    merchantContactsSchema,
} from "../schemas/contact.schema";
import type { MerchantContact } from "../types/contact.types";

export async function getMerchantContacts(
    merchantId: string
): Promise<MerchantContact[]> {
    const response = await apiClient.get(
        `/api/v1/merchants/${merchantId}/contacts`
    );

    return merchantContactsSchema.parse(response.data);
}

export async function createMerchantContact(
    merchantId: string,
    data: {
        name: string;
        role?: string;
        email?: string;
        phone?: string;
        is_primary?: boolean;
        created_by: string;
        owner_id?: string;
    }
): Promise<MerchantContact> {
    const response = await apiClient.post(
        `/api/v1/merchants/${merchantId}/contacts`,
        data
    );

    return merchantContactSchema.parse(response.data);
}

export async function updateMerchantContact(
    merchantId: string,
    contactId: string,
    data: {
        name?: string;
        role?: string | null;
        email?: string | null;
        phone?: string | null;
        is_primary?: boolean;
        created_by?: string;
        owner_id?: string | null;
    }
): Promise<MerchantContact> {
    const response = await apiClient.patch(
        `/api/v1/merchants/${merchantId}/contacts/${contactId}`,
        data
    );

    return merchantContactSchema.parse(response.data);
}

export async function deleteMerchantContact(
    merchantId: string,
    contactId: string
): Promise<void> {
    await apiClient.delete(
        `/api/v1/merchants/${merchantId}/contacts/${contactId}`
    );
}