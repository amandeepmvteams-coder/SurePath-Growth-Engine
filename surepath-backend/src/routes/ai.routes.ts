import { Router } from "express";

import {
    getAIConfigs,
    updateAIConfig,
} from "../controllers/ai-config.controller";

import {
    updateAIConfigValidator,
} from "../validators/ai-config.validator";

import {
    validate,
} from "../middleware/validation.middleware";

import {
    requireSession,
} from "../middleware/auth.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";
import { requireAdmin } from "../middleware/role.middleware";
import { aiRunValidator } from "../validators/ai-run.validator";
import { aiRunController } from "../controllers/ai-run.controller";


const router = Router();


router.get(
    "/configs",
    requireApiKey,
    requireSession,
    getAIConfigs
);


router.put(
    "/configs",
    requireApiKey,
    requireSession,
    requireAdmin,
    updateAIConfigValidator,
    validate,
    updateAIConfig
);

router.post("/run",
    requireApiKey,
    requireSession,
    aiRunValidator,
    validate,
    aiRunController.run.bind(aiRunController))


export default router;