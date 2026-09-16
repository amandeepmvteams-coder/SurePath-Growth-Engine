import { query } from "express-validator";

export const taskQueueValidator = [
  query("assigned_to")
    .optional()
    .custom((value) => {
      if (value === "unassigned") {
        return true;
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(value)) {
        throw new Error(
          "Assigned user ID must be a valid UUID or 'unassigned'"
        );
      }

      return true;
    }),

  query("merchant_id")
    .optional()
    .isUUID()
    .withMessage("Merchant ID must be a valid UUID"),

  query("open_only")
    .optional()
    .isBoolean()
    .withMessage("Open only must be a boolean"),

  query("due_before")
    .optional()
    .isISO8601()
    .withMessage(
      "Due before must be a valid ISO-8601 timestamp"
    ),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage(
      "Limit must be between 1 and 500"
    ),
];