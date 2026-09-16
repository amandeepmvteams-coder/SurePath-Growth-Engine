import { merchantRepository } from "../repositories/merchant.repository";
import { provenanceRepository } from "../repositories/merchant-provenance.repository";
import {
    CreateProvenanceInput,
    MerchantProvenance,
} from "../types/merchant-provenance.types";

class ProvenanceService {

    async getMerchantProvenance(
        merchantId: string,
        currentOnly: boolean = false
    ): Promise<MerchantProvenance[]> {

        const merchant =
            await merchantRepository.findById(
                merchantId
            );

        if (!merchant) {
            const error = new Error(
                "MERCHANT_NOT_FOUND"
            );

            (
                error as Error & {
                    statusCode?: number;
                }
            ).statusCode = 404;

            throw error;
        }

        return provenanceRepository.findByMerchantId(
            merchantId,
            currentOnly
        );
    }

    async recordProvenance(
        input: CreateProvenanceInput
    ): Promise<MerchantProvenance> {

        const merchant =
            await merchantRepository.findById(
                input.merchant_id
            );

        if (!merchant) {
            throw new Error(
                "MERCHANT_NOT_FOUND"
            );
        }

        /*
         * Manual override protection.
         *
         * Automated processing must not replace
         * a value that has been manually overridden.
         */
        if (!input.is_manual_override) {

            const current =
                await provenanceRepository.findCurrentByField(
                    input.merchant_id,
                    input.field_key
                );

            if (
                current &&
                current.is_manual_override
            ) {
                return current;
            }
        }

        return provenanceRepository.replaceCurrent(
            input
        );
    }
}

export const provenanceService =
    new ProvenanceService();