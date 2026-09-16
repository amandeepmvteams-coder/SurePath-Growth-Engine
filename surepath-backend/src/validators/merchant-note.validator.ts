import { body } from "express-validator";

export const createMerchantNoteValidator = [
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Note body is required"),
];