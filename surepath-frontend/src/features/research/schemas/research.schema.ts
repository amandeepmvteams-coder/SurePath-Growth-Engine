import { z } from "zod";

export const researchRunSchema = z.object({
    id: z.string(),
    merchant_id: z.string(),
    status: z.enum(["running", "completed", "failed"]),
    error: z.string().nullable(),
    started_at: z.string(),
    finished_at: z.string().nullable(),
    created_at: z.string(),
});

export const researchRunsSchema = z.array(
    researchRunSchema
);