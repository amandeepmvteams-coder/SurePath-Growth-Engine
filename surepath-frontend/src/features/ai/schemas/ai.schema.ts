import { z } from "zod";

export const aiRunResponseSchema = z.object({
    classified: z.number(),
    summarised: z.number(),
    policies_summarised: z.number(),
    skipped_unchanged: z.number(),
    rejected: z.number(),
    errors: z.array(z.string()),
    per_task: z.record(z.string(), z.unknown()),
});