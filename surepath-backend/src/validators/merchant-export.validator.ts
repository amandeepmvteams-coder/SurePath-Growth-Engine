import { query } from "express-validator";

export const merchantExportValidator = [

    query("q")
        .optional()
        .isString()
        .withMessage("q must be a string"),

    query("status")
        .optional()
        .isString()
        .withMessage("status must be a string"),

    query("platform")
        .optional()
        .isString()
        .withMessage("platform must be a string"),

    query("country")
        .optional()
        .isString()
        .withMessage("country must be a string"),

    query("industry")
        .optional()
        .isString()
        .withMessage("industry must be a string"),

    query("assigned_rep")
        .optional()
        .isString()
        .withMessage("assigned_rep must be a string"),

    query("sort")
        .optional()
        .isIn([
            "fit_score",
            "opportunity_value",
            "platform_confidence",
            "created_at",
            "updated_at",
        ])
        .withMessage(
            "sort must be one of: fit_score, opportunity_value, platform_confidence, created_at, updated_at"
        ),

    query("direction")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage(
            "direction must be either asc or desc"
        ),
];