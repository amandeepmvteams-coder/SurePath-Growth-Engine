import { body } from "express-validator";

export const updateAIConfigValidator = [

    body("key")
        .isString()
        .notEmpty()
        .withMessage(
            "key is required"
        ),

    body("prompt_template")
        .isString()
        .notEmpty()
        .withMessage(
            "prompt_template is required"
        ),

    body("model")
        .isString()
        .notEmpty()
        .withMessage(
            "model is required"
        ),

    body("params")
        .optional()
        .isObject()
        .withMessage(
            "params must be an object"
        ),
];