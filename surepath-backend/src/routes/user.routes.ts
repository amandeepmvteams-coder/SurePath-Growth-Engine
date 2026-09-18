import { Router } from "express";

import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    resetPassword,
    getCurrentUser,
} from "../controllers/user.controller";

import {
    createUserValidator,
    updateUserValidator,
    resetPasswordValidator,
} from "../validators/user.validator";

import { validate } from "../middleware/validation.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";
import { requireSession } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";

const router = Router();

router.get(
    "/",
    requireApiKey,
    requireSession,
    requireAdmin,
    getUsers
);

router.post(
    "/",
    requireApiKey,
    requireSession,
    requireAdmin,
    createUserValidator,
    validate,
    createUser
);

router.post(
    "/:id/password",
    requireApiKey,
    requireSession,
    requireAdmin,
    resetPasswordValidator,
    validate,
    resetPassword
);
router.get(
    "/me",
    requireApiKey,
    requireSession,
    getCurrentUser
);

router.get(
    "/:id",
    requireApiKey,
    requireSession,
    getUserById
);

router.patch(
    "/:id",
    requireApiKey,
    requireSession,
    requireAdmin,
    updateUserValidator,
    validate,
    updateUser
);


export default router;