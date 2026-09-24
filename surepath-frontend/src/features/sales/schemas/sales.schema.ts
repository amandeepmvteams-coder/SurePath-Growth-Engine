import { z } from "zod";

export const salesTaskSchema = z.object({
    id: z.string(),
    merchant_id: z.string(),
    merchant_domain: z.string(),
    merchant_store_name: z.string().nullable(),
    title: z.string(),
    notes: z.string().nullable(),
    due_at: z.string().nullable(),
    completed_at: z.string().nullable(),
    assigned_to: z.coerce.string().nullable(),
    assigned_to_id: z.string().nullable(),
    created_by: z.string(),
    created_at: z.string(),
});

export const salesTasksSchema = z.array(salesTaskSchema);

export const taskSummarySchema = z.object({
    open: z.number(),
    overdue: z.number(),
    due_today: z.number(),
    undated: z.number(),
});