import { Router } from "express";
import { scoringConfigController } from "../controllers/scoring-config.controller";
import { updateScoringConfigValidator } from "../validators/scoring-config.validator";
import { validate } from "../middleware/validation.middleware";
import { requireSession } from "../middleware/auth.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";
import { requireAdmin } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/config",
  scoringConfigController.getCurrentConfig
);

router.put(
  "/config",
  requireApiKey,
  requireSession,
  requireAdmin,
  updateScoringConfigValidator,
  validate,
  scoringConfigController.updateConfig
);

router.get(
  "/configs",
  requireApiKey,
  requireSession,
  scoringConfigController.getConfigHistory
);

export default router;