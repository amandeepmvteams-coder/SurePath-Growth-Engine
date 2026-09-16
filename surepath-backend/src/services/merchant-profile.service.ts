import { merchantProfileRepository } from "../repositories/merchant-profile.repository";
import { UpdateMerchantProfileData } from "../types/merchant-profile.types";

class MerchantProfileService {
    async getByMerchantId(merchantId: string) {
        return merchantProfileRepository.findByMerchantId(
            merchantId
        );
    }

    async updateByMerchantId(
        merchantId: string,
        data: UpdateMerchantProfileData
    ) {
        const existingProfile =
            await merchantProfileRepository.findByMerchantId(
                merchantId
            );

        if (!existingProfile) {
            return null;
        }

        return merchantProfileRepository.update(
            merchantId,
            data
        );
    }
}

export const merchantProfileService =
    new MerchantProfileService();