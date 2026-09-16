import { body } from "express-validator";

// Create User Validator 
export const createUserValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("display_name")
    .optional()
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("role")
    .optional()
    .trim(),
];

// Update User Validator 
export const updateUserValidator = [
  body("display_name")
    .optional({ nullable: true })
    .trim(),

  body("email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("role")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Role cannot be empty"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];

// Reset Password Validator 

export const resetPasswordValidator = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];