import { Router } from "express";
import { detectionRunController } from "../controllers/detection-run.controller";
import { detectionRunValidator } from "../validators/detection-run.validator";
import { requireSession } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";

const router = Router();

router.post(
    "/run",
    requireApiKey,
    requireSession,
    detectionRunValidator,
    validate,
    detectionRunController.run
);

export default router;