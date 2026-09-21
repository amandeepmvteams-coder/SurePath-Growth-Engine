import type { Merchant } from "@/features/merchants/types/merchant.types";

export interface DashboardProspect {
    merchant: Merchant;
    score: number;
}

export interface DashboardData {
    totalMerchants: number;
    scoredCount: number;
    awaitingResearchCount: number;

    stageCounts: Record<string, number>;

    bestProspects: DashboardProspect[];
}