import { Request, Response } from "express";
import { detectionRunService } from "../services/detection-run.service";
import { DetectionRunRequest } from "../types/detection-run.types";

class DetectionRunController {
    async run(
        req: Request<{}, {}, DetectionRunRequest>,
        res: Response
    ) {
        try {
            const result = await detectionRunService.run(
                req.body
            );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Detection pipeline failed",
            });
        }
    }
}

export const detectionRunController =
    new DetectionRunController();