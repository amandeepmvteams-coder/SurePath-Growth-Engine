import { Request, Response } from "express";
import { aiRunService } from "../services/ai-run.service";

class AIRunController {

    async run(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const result =
                await aiRunService.run(
                    req.body
                );

            res.status(200).json(result);

        } catch (error) {

            if (
                error instanceof Error &&
                error.message ===
                "MERCHANT_NOT_FOUND"
            ) {

                res.status(404).json({
                    message:
                        "Merchant not found",
                });

                return;
            }

            if (
                error instanceof Error &&
                error.message ===
                "AI_RUN_INPUT_REQUIRED"
            ) {

                res.status(400).json({
                    message:
                        "merchant_id, merchant_ids or limit is required",
                });

                return;
            }

            console.error(
                "AI run error:",
                error
            );

            res.status(500).json({
                message:
                    "AI run failed",
            });
        }
    }
}

export const aiRunController =
    new AIRunController();