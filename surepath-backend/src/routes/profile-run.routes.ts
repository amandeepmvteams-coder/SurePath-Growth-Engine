import { Router } from "express";

import { profileRunController } from "../controllers/profile-run.controller";
import { profileRunValidator } from "../validators/profile-run.validator";

import { requireSession } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

const router = Router();

router.post(
    "/run",
    requireSession,
    profileRunValidator,
    validate,
    profileRunController.run
);

export default router;