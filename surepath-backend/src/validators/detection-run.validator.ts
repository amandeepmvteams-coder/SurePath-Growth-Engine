import { body } from "express-validator";

export const detectionRunValidator = [
    body("merchant_id")
        .optional()
        .isUUID()
        .withMessage("merchant_id must be a valid UUID"),

    body("merchant_ids")
        .optional()
        .isArray()
        .withMessage("merchant_ids must be an array"),

    body("merchant_ids.*")
        .optional()
        .isUUID()
        .withMessage("Each merchant_id must be a valid UUID"),

    body("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("limit must be a positive integer"),
];