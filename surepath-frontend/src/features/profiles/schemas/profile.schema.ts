import { z } from "zod";

export const merchantProfileSchema = z.object({
    id: z.string(),
    merchant_id: z.string(),

    company_name: z.string().nullable(),
    description: z.string().nullable(),

    shipping_policy: z.string().nullable(),
    return_policy: z.string().nullable(),

    contact_email: z.string().nullable(),
    contact_phone: z.string().nullable(),

    shipping_policy_summary: z.string().nullable(),
    return_policy_summary: z.string().nullable(),

    research_summary: z.string().nullable(),

    estimated_monthly_orders: z.number().nullable(),
    avg_order_value: z.string().nullable(),

    traffic_estimate: z.number().nullable(),

    tech_stack: z
        .record(z.string(), z.unknown())
        .nullable(),

    updated_at: z.string(),
});

export const updateMerchantProfileSchema = z.object({
    estimated_monthly_orders: z.number().nullable().optional(),
    avg_order_value: z.string().nullable().optional(),
    shipping_policy_summary: z.string().nullable().optional(),
    return_policy_summary: z.string().nullable().optional(),
    research_summary: z.string().nullable().optional(),
});