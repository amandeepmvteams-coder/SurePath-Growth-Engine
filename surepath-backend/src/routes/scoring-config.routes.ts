import { Router } from "express";
import { scoringConfigController } from "../controllers/scoring-config.controller";
import { updateScoringConfigValidator } from "../validators/scoring-config.validator";
import { validate } from "../middleware/validation.middleware";
import { requireSession } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/config",
  scoringConfigController.getCurrentConfig
);

router.put(
  "/config",
  requireSession,
  updateScoringConfigValidator,
  validate,
  scoringConfigController.updateConfig
);

router.get(
  "/configs",
  scoringConfigController.getConfigHistory
);

export default router;