import { Request, Response } from "express";
import { researchRunRepository } from "../repositories/research.repository";
import { merchantRepository } from "../repositories/merchant.repository";

class ResearchRunController {
    async getByMerchantId(
        req: Request,
        res: Response
    ) {
        try {
            const merchantId = req.params.merchant_id;

            if (Array.isArray(merchantId)) {
                return res.status(400).json({
                    message: "Invalid merchant_id",
                });
            }

            const merchant =
                await merchantRepository.findById(merchantId);

            if (!merchant) {
                return res.status(404).json({
                    message: "Merchant not found",
                });
            }

            const runs =
                await researchRunRepository.findByMerchantId(
                    merchantId
                );

            return res.status(200).json(runs);
        } catch {
            return res.status(500).json({
                message: "Failed to fetch research runs",
            });
        }
    }
}

export const researchRunController =
    new ResearchRunController();