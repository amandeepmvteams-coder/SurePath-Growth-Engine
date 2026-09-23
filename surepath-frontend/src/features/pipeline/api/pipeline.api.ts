import { apiClient } from "@/lib/api/client";
import {
    detectionRunResultSchema,
    discoveryRunSchema,
    profileRunResultSchema,
    researchRunResultSchema,
    scoringRunResultSchema,
} from "../schemas/pipeline.schema";
import type {
    DetectionRunResult,
    DiscoveryRunResult,
    ProfileRunResult,
    ResearchRunResult,
    ScoringRunResult,
} from "../types/pipeline.types";

export async function runDiscovery(
    source: "mock" | "store_leads",
    limit: number
): Promise<DiscoveryRunResult> {
    const response = await apiClient.post("/api/v1/discovery/run", {
        source,
        limit,
    });

    return discoveryRunSchema.parse(response.data);
}

export async function runResearch(
    merchantIdsOrLimit: string[] | number
): Promise<ResearchRunResult> {
    const response = await apiClient.post("/api/v1/research/run", {
        ...(typeof merchantIdsOrLimit === "number"
            ? { limit: merchantIdsOrLimit }
            : { merchant_ids: merchantIdsOrLimit }),
    });

    return researchRunResultSchema.parse(response.data);
}

export async function runProfile(
    merchantIds: string[]
): Promise<ProfileRunResult> {
    const response = await apiClient.post("/api/v1/profiles/run", {
        merchant_ids: merchantIds,
    });

    return profileRunResultSchema.parse(response.data);
}

export async function runDetection(
    merchantIds: string[]
): Promise<DetectionRunResult> {
    const response = await apiClient.post("/api/v1/detections/run", {
        merchant_ids: merchantIds,
    });

    return detectionRunResultSchema.parse(response.data);
}

export async function runScoring(
    merchantIds: string[]
): Promise<ScoringRunResult> {
    const response = await apiClient.post("/api/v1/scoring/run", {
        merchant_ids: merchantIds,
    });

    return scoringRunResultSchema.parse(response.data);
}
