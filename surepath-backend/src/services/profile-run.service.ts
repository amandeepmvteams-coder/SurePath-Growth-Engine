import { profileGenerationService } from "./profile-generation.service";
import { merchantRepository } from "../repositories/merchant.repository";
import { ProfileRunRequest, ProfileRunResult } from "../types/profile-run.types";

class ProfileRunService {
    async run(
        data: ProfileRunRequest
    ): Promise<ProfileRunResult> {

        const merchantIds =
            await this.resolveMerchantIds(data);

        let built = 0;
        let skipped = 0;
        let contactsFound = 0;

        const errors: string[] = [];

        for (const merchantId of merchantIds) {
            try {
                const result =
                    await profileGenerationService
                        .buildProfile(merchantId);

                if (result.skipped) {
                    skipped++;
                    continue;
                }

                if (result.built) {
                    built++;
                }

                contactsFound +=
                    result.contacts_found;

            } catch (error) {
                errors.push(
                    error instanceof Error
                        ? error.message
                        : "Profile generation failed"
                );
            }
        }

        return {
            built,
            skipped,
            contacts_found: contactsFound,
            errors,
        };
    }

    private async resolveMerchantIds(
        data: ProfileRunRequest
    ): Promise<string[]> {

        // Single merchant
        if (data.merchant_id) {

            const merchant =
                await merchantRepository.findById(
                    data.merchant_id
                );

            if (!merchant) {
                throw new Error(
                    "Merchant not found"
                );
            }

            return [merchant.id];
        }

        // Specific merchants
        if (
            data.merchant_ids &&
            data.merchant_ids.length > 0
        ) {

            const uniqueIds = [
                ...new Set(data.merchant_ids)
            ];

            const merchantIds: string[] = [];

            for (const merchantId of uniqueIds) {

                const merchant =
                    await merchantRepository.findById(
                        merchantId
                    );

                if (merchant) {
                    merchantIds.push(merchant.id);
                }
            }

            return merchantIds;
        }

        // Batch
        if (data.limit) {

            const merchants =
                await merchantRepository.findForProfileRun(
                    data.limit
                );

            return merchants.map(
                merchant => merchant.id
            );
        }

        throw new Error(
            "merchant_id, merchant_ids or limit is required"
        );
    }
}

export const profileRunService =
    new ProfileRunService();