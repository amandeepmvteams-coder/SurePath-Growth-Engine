import { body } from "express-validator";

export const createMerchantContactValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("role")
    .optional()
    .trim(),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email must be valid"),

  body("phone")
    .optional()
    .trim(),

  body("is_primary")
    .optional()
    .isBoolean()
    .withMessage("is_primary must be a boolean"),

  body("created_by")
    .notEmpty()
    .isUUID()
    .withMessage("created_by must be a valid UUID"),

  body("owner_id")
    .optional()
    .isUUID()
    .withMessage("owner_id must be a valid UUID"),
];

export const updateMerchantContactValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("role")
    .optional()
    .trim(),

  body("email")
    .optional({ values: "null" })
    .trim()
    .isEmail()
    .withMessage("Email must be valid"),

  body("phone")
    .optional({ values: "null" })
    .trim(),

  body("is_primary")
    .optional()
    .isBoolean()
    .withMessage("is_primary must be a boolean"),

  body("created_by")
    .optional()
    .isUUID()
    .withMessage("created_by must be a valid UUID"),

  body("owner_id")
    .optional({ values: "null" })
    .isUUID()
    .withMessage("owner_id must be a valid UUID"),
];