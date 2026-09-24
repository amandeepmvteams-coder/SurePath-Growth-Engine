import { body } from "express-validator";

export const loginValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  body("keepSignedIn")
    .isBoolean()
    .withMessage("Keep signed in must be a boolean"),
];

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