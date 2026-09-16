import { Router } from "express";

import { researchController } from "../controllers/research.controller";
import { researchRunController } from "../controllers/research-run.controller";

import { researchRunValidator } from "../validators/research.validator";
import { validate } from "../middleware/validation.middleware";

import { requireSession } from "../middleware/auth.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";

const router = Router();

router.post(
  "/run",
  requireApiKey,
  requireSession,
  researchRunValidator,
  validate,
  researchController.run
);

export default router;