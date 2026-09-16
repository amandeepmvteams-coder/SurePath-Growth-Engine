import { Router } from "express";

import {
  login,
  logout,
  changePassword,
} from "../controllers/auth.controller";

import { requireApiKey } from "../middleware/api-key.middleware";
import { requireSession } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

import {
  changePasswordValidator,
} from "../validators/auth.validator";

const router = Router();

router.post(
  "/login",
  requireApiKey,
  login
);

router.post(
  "/logout",
  requireApiKey,
  requireSession,
  logout
);

router.post(
  "/password",
  requireApiKey,
  requireSession,
  changePasswordValidator,
  validate,
  changePassword
);

export default router;