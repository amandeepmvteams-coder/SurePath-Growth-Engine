import { z } from "zod";

export const assignedRepSchema = z.object({
    id: z.string(),
    username: z.string(),
    display_name: z.string(),
    email: z.string(),
});

export const merchantSchema = z.object({
    id: z.string(),
    domain: z.string(),
    platform: z.string().nullable(),
    store_name: z.string().nullable(),
    country: z.string().nullable(),
    industry: z.string().nullable(),
    status: z.string(),
    assigned_rep_id: z.string().nullable(),
    assigned_rep: assignedRepSchema.nullable().optional(),
    next_follow_up_at: z.string().nullable(),
    outcome_reason: z.string().nullable(),
    outcome_at: z.string().nullable(),
    last_activity_at: z.string().nullable(),
    source: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});
export const createMerchantSchema = merchantSchema.omit({
  assigned_rep: true,
});
export const merchantPaginationSchema = z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
});

export const getMerchantsResponseSchema = z.object({
    data: z.array(merchantSchema),
    pagination: merchantPaginationSchema,
});