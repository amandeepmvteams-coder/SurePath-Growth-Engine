import { z } from "zod";

export const merchantDetectionSchema = z.object({
    id: z.string(),
    merchant_id: z.string(),
    provider_name: z.string(),
    is_detected: z.boolean(),
    confidence: z.coerce.number().nullable(),
    evidence: z.record(z.string(), z.unknown()).nullable(),
    detected_at: z.string(),
    source: z.string().nullable(),
    is_manual_override: z.boolean(),
    overridden_by: z.string().nullable(),
    override_reason: z.string().nullable(),
});

export const merchantDetectionsSchema = z.array(
    merchantDetectionSchema
);