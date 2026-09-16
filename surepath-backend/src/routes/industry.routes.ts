import { Router } from "express";

import {
    getIndustries,
} from "../controllers/industry.controller";

import {
    requireSession,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
    "/",
    requireSession,
    getIndustries
);

export default router;