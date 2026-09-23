import { z } from "zod";

export const discoveryRunSchema = z.object({
    source: z.enum(["mock", "store_leads"]),
    created: z.number(),
    updated: z.number(),
    failed: z.number(),
    total: z.number(),
    errors: z.array(z.string()),
    merchant_ids: z.array(z.string()),
});

export const researchRunResultSchema = z.object({
    researched: z.number(),
    merchant_ids: z.array(z.string()),
    failed: z.number(),
    errors: z.array(z.unknown()),
    pages_found: z.number(),
    pages_missing: z.number(),
});

export const profileRunResultSchema = z.object({
    built: z.number(),
    skipped: z.number(),
    contacts_found: z.number(),
    errors: z.array(z.string()),
});

export const detectionRunResultSchema = z.object({
    merchants: z.number(),
    detections: z.number(),
    errors: z.array(z.string()),
});

export const scoringRunResultSchema = z.object({
    scored: z.number(),
    skipped: z.number(),
    opportunity_values: z.number(),
    errors: z.array(z.unknown()),
});
