import { merchantRepository } from "../repositories/merchant.repository";
import { researchRunRepository } from "../repositories/research-run.repository";
import { researchService } from "./research.service";
import {
  ResearchRunRequest,
  ResearchRunResult,
} from "../types/research-run.types";

class ResearchRunService {
  async run(
    data: ResearchRunRequest
  ): Promise<ResearchRunResult> {
    let merchants: any[] = [];

    if (data.merchant_id) {
      const merchant =
        await merchantRepository.findById(
          data.merchant_id
        );

      if (!merchant) {
        throw new Error("MERCHANT_NOT_FOUND");
      }

      merchants = [merchant];
    } else if (
      data.merchant_ids &&
      data.merchant_ids.length > 0
    ) {
      for (const merchantId of data.merchant_ids) {
        const merchant =
          await merchantRepository.findById(
            merchantId
          );

        if (merchant) {
          merchants.push(merchant);
        }
      }
    } else if (data.limit) {
      merchants =
        await researchRunRepository
          .findLeastRecentlyResearched(
            data.limit
          );
    } else {
      throw new Error(
        "RESEARCH_INPUT_REQUIRED"
      );
    }

    let researched = 0;
    let failed = 0;
    let pagesFound = 0;
    let pagesMissing = 0;

    const merchantIds: string[] = [];
    const errors: unknown[] = [];

    for (const merchant of merchants) {
      merchantIds.push(merchant.id);

      try {
        const result =
          await researchService.researchMerchant(
            merchant.id
          );

        researched++;

        pagesFound += result.pages_found;
        pagesMissing += result.pages_missing;
      } catch (error) {
        failed++;

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
      researched,
      merchant_ids: merchantIds,
      failed,
      errors,
      pages_found: pagesFound,
      pages_missing: pagesMissing,
    };
  }
}

export const researchRunService =
  new ResearchRunService();