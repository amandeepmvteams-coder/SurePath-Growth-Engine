import { merchantRepository } from "../repositories/merchant.repository";
import { scoringConfigRepository } from "../repositories/scoring-config.repository";
import { merchantScoreRepository } from "../repositories/merchant-score.repository";
import { scoringCalculationService } from "./scoring-calculation.service";
import {
  ScoringRunRequest,
  ScoringRunResult,
} from "../types/scoring-run.types";

class ScoringRunService {
  async run(
    data: ScoringRunRequest
  ): Promise<ScoringRunResult> {
    const scoringConfig =
      await scoringConfigRepository.findActive();

    if (!scoringConfig) {
      throw new Error("SCORING_CONFIG_NOT_FOUND");
    }

    let merchants = [];

    // 1. Score one merchant
    if (data.merchant_id) {
      const merchant = await merchantRepository.findById(
        data.merchant_id
      );

      if (!merchant) {
        throw new Error("MERCHANT_NOT_FOUND");
      }

      merchants = [merchant];
    }

    // 2. Score specific merchants
    else if (
      data.merchant_ids &&
      data.merchant_ids.length > 0
    ) {
      for (const merchantId of data.merchant_ids) {
        const merchant =
          await merchantRepository.findById(merchantId);

        if (merchant) {
          merchants.push(merchant);
        }
      }
    }

    // 3. Score merchants using limit
    else if (data.limit) {
      merchants = await merchantRepository.findAll(
        data.limit,
        0
      );
    }

    // No input
    else {
      throw new Error("SCORING_INPUT_REQUIRED");
    }

    let scored = 0;
    let skipped = 0;
    let opportunityValues = 0;
    const errors: unknown[] = [];

    for (const merchant of merchants) {
      try {
        const calculation =
          await scoringCalculationService.calculateScore(
            merchant,
            scoringConfig
          );

        await merchantScoreRepository.create({
          merchant_id: merchant.id,
          scoring_config_id: scoringConfig.id,
          score: calculation.score,
          score_factors_assessed:
            calculation.score_factors_assessed,
          score_factors_total:
            calculation.score_factors_total,
          score_breakdown:
            calculation.score_breakdown,
          opportunity_value:
            calculation.opportunity_value,
          opportunity_inputs:
            calculation.opportunity_inputs,
        });

        scored++;

        if (calculation.opportunity_value !== null) {
          opportunityValues++;
        }
      } catch (error) {
        skipped++;

        errors.push({
          merchant_id: merchant.id,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
      }
    }

    return {
      scored,
      skipped,
      opportunity_values: opportunityValues,
      errors,
    };
  }
}

export const scoringRunService =
  new ScoringRunService();