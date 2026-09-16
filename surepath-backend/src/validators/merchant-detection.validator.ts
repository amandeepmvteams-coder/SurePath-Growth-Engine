import { body } from "express-validator";

export const createMerchantDetectionValidator = [
  body("provider_name")
    .trim()
    .notEmpty()
    .withMessage("Provider name is required"),

  body("is_detected")
    .isBoolean()
    .withMessage("Is detected must be a boolean"),

  body("confidence")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 1 })
    .withMessage("Confidence must be between 0 and 1"),

  body("evidence")
    .optional({ nullable: true })
    .isObject()
    .withMessage("Evidence must be an object"),

  body("source")
    .optional()
    .trim(),

  body("override_reason")
    .optional()
    .trim(),
];

export const updateMerchantDetectionValidator = [
  body("provider_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Provider name cannot be empty"),

  body("is_detected")
    .optional()
    .isBoolean()
    .withMessage("Is detected must be a boolean"),

  body("confidence")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 1 })
    .withMessage("Confidence must be between 0 and 1"),

  body("evidence")
    .optional({ nullable: true })
    .isObject()
    .withMessage("Evidence must be an object"),

  body("override_reason")
    .optional()
    .trim(),
];