import { merchantStatusHistoryRepository } from "../repositories/merchant-status-history.repository";

class MerchantStatusHistoryService {
  async getByMerchantId(merchantId: string) {
    return merchantStatusHistoryRepository.findByMerchantId(
      merchantId
    );
  }
}

export const merchantStatusHistoryService =
  new MerchantStatusHistoryService();