import { body } from "express-validator";
import { query } from "express-validator";

export const createMerchantValidator = [
    body("domain")
        .trim()
        .notEmpty()
        .withMessage("Domain is required"),

    body("platform")
        .optional()
        .trim(),

    body("store_name")
        .optional()
        .trim(),

    body("country")
        .optional()
        .trim(),

    body("industry")
        .optional()
        .trim(),

    body("source")
        .optional()
        .trim(),
];

export const updateMerchantValidator = [
    body("platform")
        .optional({ nullable: true })
        .trim(),

    body("store_name")
        .optional({ nullable: true })
        .trim(),

    body("country")
        .optional({ nullable: true })
        .trim(),

    body("industry")
        .optional({ nullable: true })
        .trim(),

    body("status")
        .optional({ nullable: true })
        .trim(),

    body("assigned_rep_id")
        .optional({ nullable: true }),

    body("next_follow_up_at")
        .optional({ nullable: true }),

    body("outcome_reason")
        .optional({ nullable: true })
        .trim(),
];

export const getMerchantsValidator = [
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("offset")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Offset must be 0 or greater"),

    query("q")
        .optional()
        .trim(),

    query("status")
        .optional()
        .trim(),

    query("platform")
        .optional()
        .trim(),

    query("country")
        .optional()
        .trim(),

    query("industry")
        .optional()
        .trim(),

    query("assigned_rep")
        .optional()
        .trim(),

    query("sort")
        .optional()
        .isIn([
            "created_at",
            "updated_at",
            "domain",
            "store_name",
            "status",
            "platform",
            "country",
            "industry",
            "fit_score",
        ])
        .withMessage("Invalid sort field"),

    query("direction")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Direction must be asc or desc"),
];