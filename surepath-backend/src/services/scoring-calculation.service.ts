import { ScoringConfig } from "../types/scoring-config.types";
import { Merchant } from "../types/merchant.types";
import { merchantContactRepository } from "../repositories/merchant-contact.repository";
import { merchantDetectionRepository } from "../repositories/merchant-detection.repository";
import { merchantProfileRepository } from "../repositories/merchant-profile.repository";
interface ScoringCalculationResult {
    score: number;

    score_factors_assessed: number;
    score_factors_total: number;

    score_breakdown: Record<string, unknown>;

    opportunity_value: number | null;
    opportunity_inputs: Record<string, unknown>;
}

class ScoringCalculationService {
    async calculateScore(
        merchant: Merchant,
        config: ScoringConfig
    ): Promise<ScoringCalculationResult> {
        const criteria = config.criteria ?? {};

        const factorNames = Object.keys(criteria);

        const scoreFactorsTotal = factorNames.length;

        let earnedPoints = 0;
        let possiblePoints = 0;
        let scoreFactorsAssessed = 0;

        const scoreBreakdown: Record<string, unknown> = {};

        if (config.scoring_factors.contactable) {
            const hasContact =
                await merchantContactRepository.hasContact(merchant.id);

            if (hasContact) {
                earnedPoints += Number(config.factor_weights.contactable);
                possiblePoints += Number(config.factor_weights.contactable);
                scoreFactorsAssessed++;

                scoreBreakdown.contactable = {
                    points_earned: Number(config.factor_weights.contactable),
                    maximum_points: Number(config.factor_weights.contactable),
                    status: "assessed",
                    reason: "Merchant has at least one contact",
                };
            } else {
                scoreBreakdown.contactable = {
                    points_earned: 0,
                    maximum_points: Number(config.factor_weights.contactable),
                    status: "skipped",
                    reason: "No merchant contact information is available",
                };
            }
        }

        if (config.scoring_factors.target_country) {
            const targetCountryCriteria = criteria.target_country as {
                countries?: string[];
            };

            const targetCountries =
                targetCountryCriteria?.countries ?? [];

            if (merchant.country && targetCountries.length > 0) {
                const isTargetCountry = targetCountries.some(
                    (country) =>
                        country.toLowerCase() === merchant.country?.toLowerCase()
                );

                if (isTargetCountry) {
                    earnedPoints += Number(config.factor_weights.target_country);
                }

                possiblePoints += Number(config.factor_weights.target_country);
                scoreFactorsAssessed++;

                scoreBreakdown.target_country = {
                    points_earned: isTargetCountry
                        ? Number(config.factor_weights.target_country)
                        : 0,
                    maximum_points: Number(config.factor_weights.target_country),
                    status: "assessed",
                    reason: isTargetCountry
                        ? `Merchant country ${merchant.country} is a target country`
                        : `Merchant country ${merchant.country} is not a target country`,
                };
            } else {
                scoreBreakdown.target_country = {
                    points_earned: 0,
                    maximum_points: Number(config.factor_weights.target_country),
                    status: "skipped",
                    reason: "Target countries or merchant country are not available",
                };
            }
        }

        if (config.scoring_factors.target_industry) {
            const targetIndustryCriteria = criteria.target_industry as {
                industries?: string[];
            };

            const targetIndustries =
                targetIndustryCriteria?.industries ?? [];

            if (merchant.industry && targetIndustries.length > 0) {
                const isTargetIndustry = targetIndustries.some(
                    (industry) =>
                        industry.toLowerCase() === merchant.industry?.toLowerCase()
                );

                if (isTargetIndustry) {
                    earnedPoints += Number(config.factor_weights.target_industry);
                }

                possiblePoints += Number(config.factor_weights.target_industry);
                scoreFactorsAssessed++;

                scoreBreakdown.target_industry = {
                    points_earned: isTargetIndustry
                        ? Number(config.factor_weights.target_industry)
                        : 0,
                    maximum_points: Number(config.factor_weights.target_industry),
                    status: "assessed",
                    reason: isTargetIndustry
                        ? `Merchant industry ${merchant.industry} is a target industry`
                        : `Merchant industry ${merchant.industry} is not a target industry`,
                };
            } else {
                scoreBreakdown.target_industry = {
                    points_earned: 0,
                    maximum_points: Number(config.factor_weights.target_industry),
                    status: "skipped",
                    reason: "Target industries or merchant industry are not available",
                };
            }
        }

        if (config.scoring_factors.platform_confirmed) {
            const platformCriteria = criteria.platform_confirmed as {
                platforms?: string[];
            };

            const targetPlatforms =
                platformCriteria?.platforms ?? [];

            if (merchant.platform && targetPlatforms.length > 0) {
                const isPlatformConfirmed = targetPlatforms.some(
                    (platform) =>
                        platform.toLowerCase() === merchant.platform?.toLowerCase()
                );

                if (isPlatformConfirmed) {
                    earnedPoints += Number(config.factor_weights.platform_confirmed);
                }

                possiblePoints += Number(config.factor_weights.platform_confirmed);
                scoreFactorsAssessed++;

                scoreBreakdown.platform_confirmed = {
                    points_earned: isPlatformConfirmed
                        ? Number(config.factor_weights.platform_confirmed)
                        : 0,
                    maximum_points: Number(config.factor_weights.platform_confirmed),
                    status: "assessed",
                    reason: isPlatformConfirmed
                        ? `Merchant platform ${merchant.platform} is confirmed`
                        : `Merchant platform ${merchant.platform} is not a target platform`,
                };
            } else {
                scoreBreakdown.platform_confirmed = {
                    points_earned: 0,
                    maximum_points: Number(config.factor_weights.platform_confirmed),
                    status: "skipped",
                    reason: "Target platforms or merchant platform are not available",
                };
            }
        }

        if (config.scoring_factors.no_existing_provider) {
            const hasDetectedProvider =
                await merchantDetectionRepository.hasDetectedProvider(
                    merchant.id
                );

            possiblePoints += Number(
                config.factor_weights.no_existing_provider
            );
            scoreFactorsAssessed++;

            if (!hasDetectedProvider) {
                earnedPoints += Number(
                    config.factor_weights.no_existing_provider
                );
            }

            scoreBreakdown.no_existing_provider = {
                points_earned: hasDetectedProvider
                    ? 0
                    : Number(config.factor_weights.no_existing_provider),
                maximum_points: Number(
                    config.factor_weights.no_existing_provider
                ),
                status: "assessed",
                reason: hasDetectedProvider
                    ? "An existing provider was detected"
                    : "No existing provider was detected",
            };
        }

        if (config.scoring_factors.weak_returns_coverage) {
            const profile =
                await merchantProfileRepository.findByMerchantId(
                    merchant.id
                );

            const returnPolicy =
                profile?.return_policy_summary ||
                profile?.return_policy;

            if (returnPolicy) {
                const weakReturnTerms = [
                    "no return",
                    "no returns",
                    "non-refundable",
                    "non refundable",
                    "final sale",
                ];

                const isWeakReturnsCoverage =
                    weakReturnTerms.some((term) =>
                        returnPolicy.toLowerCase().includes(term)
                    );

                if (isWeakReturnsCoverage) {
                    earnedPoints += Number(
                        config.factor_weights.weak_returns_coverage
                    );
                }

                possiblePoints += Number(
                    config.factor_weights.weak_returns_coverage
                );

                scoreFactorsAssessed++;

                scoreBreakdown.weak_returns_coverage = {
                    points_earned: isWeakReturnsCoverage
                        ? Number(config.factor_weights.weak_returns_coverage)
                        : 0,
                    maximum_points: Number(
                        config.factor_weights.weak_returns_coverage
                    ),
                    status: "assessed",
                    reason: isWeakReturnsCoverage
                        ? "Merchant has weak returns coverage"
                        : "Merchant has adequate returns coverage",
                };
            } else {
                scoreBreakdown.weak_returns_coverage = {
                    points_earned: 0,
                    maximum_points: Number(
                        config.factor_weights.weak_returns_coverage
                    ),
                    status: "skipped",
                    reason: "Return policy information is not available",
                };
            }
        }

        const score =
            possiblePoints > 0
                ? (earnedPoints / possiblePoints) * 100
                : 0;

        // Calculate opportunity value
        let opportunityValue: number | null = null;

        const opportunityInputs: Record<string, unknown> = {};

        const profile =
            await merchantProfileRepository.findByMerchantId(
                merchant.id
            );

        const estimatedMonthlyOrders =
            profile?.estimated_monthly_orders;

        const attachRate = config.attach_rate;
        const revenuePerOrder = config.revenue_per_order;

        if (
            estimatedMonthlyOrders !== null &&
            estimatedMonthlyOrders !== undefined &&
            attachRate !== null &&
            attachRate !== undefined &&
            revenuePerOrder !== null &&
            revenuePerOrder !== undefined
        ) {
            opportunityValue =
                Number(estimatedMonthlyOrders) *
                Number(attachRate) *
                Number(revenuePerOrder);

            opportunityInputs.estimated_monthly_orders =
                Number(estimatedMonthlyOrders);

            opportunityInputs.attach_rate =
                Number(attachRate);

            opportunityInputs.revenue_per_order =
                Number(revenuePerOrder);

            opportunityInputs.formula =
                "estimated_monthly_orders × attach_rate × revenue_per_order";
        }
        return {
            score,
            score_factors_assessed: scoreFactorsAssessed,
            score_factors_total: scoreFactorsTotal,
            score_breakdown: scoreBreakdown,
            opportunity_value: opportunityValue,
            opportunity_inputs: opportunityInputs,
        };
    }
}

export const scoringCalculationService =
    new ScoringCalculationService();