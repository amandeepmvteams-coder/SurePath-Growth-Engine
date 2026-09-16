import { Router } from "express";
import { detectionRunController } from "../controllers/detection-run.controller";
import { detectionRunValidator } from "../validators/detection-run.validator";
import { requireSession } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

const router = Router();

router.post(
    "/run",
    requireSession,
    detectionRunValidator,
    validate,
    detectionRunController.run
);

export default router;