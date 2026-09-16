import { merchantDetectionRepository } from "../repositories/merchant-detection.repository";
import { merchantRepository } from "../repositories/merchant.repository";
import {
  CreateMerchantDetectionData,
  UpdateMerchantDetectionData,
} from "../types/merchant-detection.types";

class MerchantDetectionService {
  async getByMerchantId(merchantId: string) {
    const merchant = await merchantRepository.findById(merchantId);

    if (!merchant) {
      return null;
    }

    return merchantDetectionRepository.findByMerchantId(merchantId);
  }

  async create(
    merchantId: string,
    data: CreateMerchantDetectionData
  ) {
    const merchant = await merchantRepository.findById(merchantId);

    if (!merchant) {
      return null;
    }

    const providerName = data.provider_name?.trim();

    if (!providerName) {
      throw new Error("PROVIDER_NAME_REQUIRED");
    }

    if (data.confidence !== undefined) {
      if (
        data.confidence < 0 ||
        data.confidence > 1
      ) {
        throw new Error("INVALID_CONFIDENCE");
      }
    }

    return merchantDetectionRepository.create(
      merchantId,
      {
        ...data,
        provider_name: providerName,
      }
    );
  }

  async update(
    merchantId: string,
    detectionId: string,
    data: UpdateMerchantDetectionData
  ) {
    const existingDetection =
      await merchantDetectionRepository.findById(detectionId);

    if (!existingDetection) {
      return null;
    }

    if (existingDetection.merchant_id !== merchantId) {
      return null;
    }

    if (data.provider_name !== undefined) {
      const providerName = data.provider_name.trim();

      if (!providerName) {
        throw new Error("PROVIDER_NAME_REQUIRED");
      }

      data.provider_name = providerName;
    }

    if (data.confidence !== undefined && data.confidence !== null) {
      if (
        data.confidence < 0 ||
        data.confidence > 1
      ) {
        throw new Error("INVALID_CONFIDENCE");
      }
    }

    return merchantDetectionRepository.update(
      detectionId,
      data
    );
  }
}

export const merchantDetectionService =
  new MerchantDetectionService();