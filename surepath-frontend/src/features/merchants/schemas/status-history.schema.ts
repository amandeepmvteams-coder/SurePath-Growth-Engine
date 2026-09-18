import { z } from "zod";

export const merchantStatusHistorySchema = z.object({
    id: z.string(),
    merchant_id: z.string(),
    from_status: z.string().nullable(),
    to_status: z.string(),
    changed_by: z.string().nullable(),
    changed_at: z.string(),
});

export const merchantStatusHistoriesSchema = z.array(
    merchantStatusHistorySchema
);