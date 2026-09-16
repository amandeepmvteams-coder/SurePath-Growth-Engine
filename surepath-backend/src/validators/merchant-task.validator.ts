import { body } from "express-validator";

export const createMerchantTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("notes")
    .optional()
    .trim(),

  body("assigned_to_id")
    .optional()
    .isUUID()
    .withMessage("Assigned user ID must be a valid UUID"),

  body("due_at")
    .optional()
    .isISO8601()
    .withMessage("Due at must be a valid ISO-8601 timestamp"),

  body("created_by")
    .optional()
    .isUUID()
    .withMessage("Created by must be a valid UUID"),
];


export const updateMerchantTaskValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("notes")
    .optional()
    .trim(),

  body("assigned_to_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Assigned user ID must be a valid UUID"),

  body("due_at")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Due at must be a valid ISO-8601 timestamp"),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
];