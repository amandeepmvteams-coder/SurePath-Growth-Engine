import {
    body,
} from "express-validator";

export const discoveryRunValidator = [

    body("source")
        .optional()
        .isIn([
            "mock",
            "store_leads",
        ])
        .withMessage(
            "source must be mock or store_leads"
        ),

    body("limit")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage(
            "limit must be a positive integer"
        ),
];