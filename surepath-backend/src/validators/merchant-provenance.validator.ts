import {
    param,
    query,
} from "express-validator";

export const getMerchantProvenanceValidator = [
    param("merchant_id")
        .isUUID()
        .withMessage(
            "merchant_id must be a valid UUID"
        ),

    query("current_only")
        .optional()
        .isBoolean()
        .withMessage(
            "current_only must be a boolean"
        ),
];