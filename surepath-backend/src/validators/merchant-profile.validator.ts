import { body } from "express-validator";

export const updateMerchantProfileValidator = [
  body("estimated_monthly_orders")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "estimated_monthly_orders must be a non-negative integer"
    ),

  body("avg_order_value")
    .optional()
    .isDecimal()
    .withMessage(
      "avg_order_value must be a valid decimal number"
    ),
];