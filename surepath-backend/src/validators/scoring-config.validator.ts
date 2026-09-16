import { body } from "express-validator";

export const updateScoringConfigValidator = [
  body("scoring_factors")
    .optional()
    .isObject()
    .withMessage("scoring_factors must be an object"),

  body("factor_weights")
    .optional()
    .isObject()
    .withMessage("factor_weights must be an object"),

  body("criteria")
    .optional()
    .isObject()
    .withMessage("criteria must be an object"),

  body("attach_rate")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("attach_rate must be between 0 and 1"),

  body("revenue_per_order")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("revenue_per_order must be greater than or equal to 0"),

  body("commercial_assumptions")
    .optional()
    .isObject()
    .withMessage("commercial_assumptions must be an object"),
];