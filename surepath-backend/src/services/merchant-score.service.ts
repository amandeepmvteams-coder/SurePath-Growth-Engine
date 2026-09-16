import { merchantScoreRepository } from "../repositories/merchant-score.repository";
import { merchantRepository } from "../repositories/merchant.repository";
import { scoringConfigRepository } from "../repositories/scoring-config.repository";
import { CreateMerchantScoreData } from "../types/merchant-score.types";

class MerchantScoreService {
  async getByMerchantId(merchantId: string) {
    const merchant = await merchantRepository.findById(merchantId);

    if (!merchant) {
      return null;
    }

    return merchantScoreRepository.findByMerchantId(merchantId);
  }

  async create(data: CreateMerchantScoreData) {
    const merchant = await merchantRepository.findById(
      data.merchant_id
    );

    if (!merchant) {
      return null;
    }

    const scoringConfig =
      await scoringConfigRepository.findActive();

    if (!scoringConfig) {
      throw new Error("SCORING_CONFIG_NOT_FOUND");
    }

    return merchantScoreRepository.create({
      ...data,
      scoring_config_id: scoringConfig.id,
    });
  }
}

export const merchantScoreService =
  new MerchantScoreService();