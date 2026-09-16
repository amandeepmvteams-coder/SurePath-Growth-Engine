import { Router } from "express";

import {
    runDiscovery,
} from "../controllers/discovery.controller";

import {
    discoveryRunValidator,
} from "../validators/discovery.validator";

import {
    validate,
} from "../middleware/validation.middleware";

import {
    requireSession,
} from "../middleware/auth.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";

const router = Router();

router.post(
    "/run",
    requireApiKey,
    requireSession,
    discoveryRunValidator,
    validate,
    runDiscovery
);

export default router;