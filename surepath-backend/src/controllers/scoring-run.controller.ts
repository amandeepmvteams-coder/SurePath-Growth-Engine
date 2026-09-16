import { Request, Response } from "express";
import { scoringRunService } from "../services/scoring-run.service";
import { ScoringRunRequest } from "../types/scoring-run.types";

export const scoringRunController = {
    async run(
        req: Request<{}, {}, ScoringRunRequest>,
        res: Response
    ) {
        try {
            const result = await scoringRunService.run(req.body);

            return res.status(200).json(result);
        } catch (error) {
            if (!(error instanceof Error)) {
                throw error;
            }

            switch (error.message) {
                case "MERCHANT_ID_REQUIRED":
                    return res.status(400).json({
                        message: "Merchant ID is required",
                    });

                case "MERCHANT_NOT_FOUND":
                    return res.status(404).json({
                        message: "Merchant not found",
                    });

                case "SCORING_CONFIG_NOT_FOUND":
                    return res.status(404).json({
                        message: "Scoring configuration not found",
                    });

                case "SCORING_INPUT_REQUIRED":
                    return res.status(400).json({
                        message:
                            "Provide merchant_id, merchant_ids, or limit",
                    });

                default:
                    console.error("Scoring run failed:", error);

                    return res.status(500).json({
                        message: "Scoring run failed",
                    });
            }
        }
    },
};