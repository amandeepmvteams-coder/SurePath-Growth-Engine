import { body } from "express-validator";

export const changePasswordValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),

  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),

  body("new_password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 10 })
    .withMessage(
      "New password must be at least 10 characters"
    ),
];