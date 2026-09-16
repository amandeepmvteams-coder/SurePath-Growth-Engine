import { Request, Response } from "express";
import { profileRunService } from "../services/profile-run.service";
import { ProfileRunRequest } from "../types/profile-run.types";

class ProfileRunController {
    async run(
        req: Request<{}, {}, ProfileRunRequest>,
        res: Response
    ) {
        try {
            const result =
                await profileRunService.run(req.body);

            return res.status(200).json(result);

        } catch (error) {
            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Profile generation failed",
            });
        }
    }
}

export const profileRunController =
    new ProfileRunController();