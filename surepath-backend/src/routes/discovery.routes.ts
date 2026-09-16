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

const router = Router();

router.post(
    "/run",
    requireSession,
    discoveryRunValidator,
    validate,
    runDiscovery
);

export default router;