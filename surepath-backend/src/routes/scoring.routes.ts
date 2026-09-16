import { Router } from "express";
import { scoringRunController } from "../controllers/scoring-run.controller";
import { requireSession } from "../middleware/auth.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";

const router = Router();

router.post(
  "/run",
  requireApiKey,
  requireSession,
  scoringRunController.run
);

export default router;