import { Router } from "express";
import { scoringRunController } from "../controllers/scoring-run.controller";
import { requireSession } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/run",
  requireSession,
  scoringRunController.run
);

export default router;