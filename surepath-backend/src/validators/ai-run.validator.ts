import { body } from "express-validator";


export const aiRunValidator = [

    body("merchant_id")
        .optional()
        .isUUID()
        .withMessage(
            "merchant_id must be a valid UUID"
        ),


    body("merchant_ids")
        .optional()
        .isArray()
        .withMessage(
            "merchant_ids must be an array"
        ),


    body("merchant_ids.*")
        .optional()
        .isUUID()
        .withMessage(
            "Each merchant_id must be a valid UUID"
        ),


    body("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage(
            "limit must be between 1 and 100"
        ),


    body("tasks")
        .optional()
        .isArray()
        .withMessage(
            "tasks must be an array"
        ),


    body("tasks.*")
        .optional()
        .isIn([
            "industry_classify",
            "policy_summary",
            "research_summary",
        ])
        .withMessage(
            "Task must be one of: industry_classify, policy_summary, research_summary"
        ),

];