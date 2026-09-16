import { Router } from "express";

import {
    getIndustries,
} from "../controllers/industry.controller";

import {
    requireSession,
} from "../middleware/auth.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";

const router = Router();

router.get(
    "/",
    requireApiKey,
    requireSession,
    getIndustries
);

export default router;