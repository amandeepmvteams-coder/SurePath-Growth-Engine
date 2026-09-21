import { getMerchants } from "@/features/merchants/api/merchants.api";
import { getMerchantScores } from "@/features/scoring/api/scoring.api";
import { getMerchantResearch } from "@/features/research/api/research.api";

import type { DashboardData } from "../types/dashboard.types";

export async function getDashboardData(): Promise<DashboardData> {
    const merchantResponse = await getMerchants({
        limit: 100,
        offset: 0,
    });

    const merchants = merchantResponse.data;

    const merchantResults = await Promise.all(
        merchants.map(async (merchant) => {
            const [scores, researchRuns] = await Promise.all([
                getMerchantScores(merchant.id),
                getMerchantResearch(merchant.id),
            ]);

            return {
                merchant,
                scores,
                researchRuns,
            };
        })
    );

    const scoredResults = merchantResults.filter(
        ({ scores }) => scores.length > 0
    );

    const awaitingResearchCount = merchantResults.filter(
        ({ researchRuns }) => researchRuns.length === 0
    ).length;

    const stageCounts = merchants.reduce<Record<string, number>>(
        (acc, merchant) => {
            acc[merchant.status] =
                (acc[merchant.status] ?? 0) + 1;

            return acc;
        },
        {}
    );

    const bestProspects = scoredResults
        .map(({ merchant, scores }) => {
            const latestScore = [...scores].sort(
                (a, b) =>
                    new Date(b.scored_at).getTime() -
                    new Date(a.scored_at).getTime()
            )[0];

            return {
                merchant,
                score: latestScore.score,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return {
        totalMerchants: merchantResponse.pagination.total,
        scoredCount: scoredResults.length,
        awaitingResearchCount,
        stageCounts,
        bestProspects,
    };
}