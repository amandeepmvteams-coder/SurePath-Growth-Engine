import { body } from "express-validator";

export const createMerchantActivityValidator = [
  body("activity_type")
    .trim()
    .notEmpty()
    .withMessage("Activity type is required"),

  body("direction")
    .optional()
    .trim(),

  body("channel")
    .optional()
    .trim(),

  body("subject")
    .optional()
    .trim(),

  body("body")
    .optional()
    .trim(),

  body("occurred_at")
    .notEmpty()
    .withMessage("Occurred at is required")
    .isISO8601()
    .withMessage("Occurred at must be a valid ISO-8601 timestamp"),

  body("logged_by")
    .optional()
    .trim(),

  body("detail")
    .optional()
    .isObject()
    .withMessage("Detail must be an object"),
];