import { merchantRepository } from "../repositories/merchant.repository";
import { merchantDetectionRepository } from "../repositories/merchant-detection.repository";
import { providerDetectionService } from "./provider-detection.service";
import { DetectionRunRequest, DetectionRunResult } from "../types/detection-run.types";

class DetectionRunService {

    async run(
        input: DetectionRunRequest
    ): Promise<DetectionRunResult> {

        const merchants = await this.resolveMerchants(input);

        let merchantsProcessed = 0;
        let detections = 0;
        const errors: string[] = [];

        for (const merchant of merchants) {
            try {
                const results =
                    await providerDetectionService.detectForMerchant(
                        merchant.id
                    );

                for (const result of results) {

                    if (!result.is_detected) {
                        continue;
                    }

                    const savedDetection =
                        await merchantDetectionRepository.saveAutomatedDetection(
                            merchant.id,
                            {
                                provider_name: result.provider_name,
                                is_detected: true,
                                confidence: result.confidence,
                                evidence: result.evidence,
                                source: "automated",
                            }
                        );

                    if (savedDetection) {
                        detections++;
                    }
                }

                merchantsProcessed++;

            } catch (error) {
                errors.push(
                    `${merchant.id}: ${error instanceof Error
                        ? error.message
                        : "Detection failed"
                    }`
                );
            }
        }

        return {
            merchants: merchantsProcessed,
            detections,
            errors,
        };
    }

    private async resolveMerchants(
        input: DetectionRunRequest
    ) {

        if (input.merchant_id) {
            const merchant =
                await merchantRepository.findById(
                    input.merchant_id
                );

            if (!merchant) {
                throw new Error("MERCHANT_NOT_FOUND");
            }

            return [merchant];
        }

        if (
            input.merchant_ids &&
            input.merchant_ids.length > 0
        ) {
            const merchants = [];

            for (const merchantId of [
                ...new Set(input.merchant_ids),
            ]) {
                const merchant =
                    await merchantRepository.findById(
                        merchantId
                    );

                if (!merchant) {
                    throw new Error(
                        `MERCHANT_NOT_FOUND: ${merchantId}`
                    );
                }

                merchants.push(merchant);
            }

            return merchants;
        }

        if (input.limit !== undefined) {
            return merchantRepository.findForDetectionRun(
                input.limit
            );
        }

        throw new Error(
            "MERCHANT_SELECTION_REQUIRED"
        );
    }
}

export const detectionRunService =
    new DetectionRunService();