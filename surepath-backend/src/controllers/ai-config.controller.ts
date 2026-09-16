import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    aiConfigService,
} from "../services/ai-config.service";

import {
    CreateAIConfigInput,
} from "../types/ai-config.types";


export const getAIConfigs = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const configs =
            await aiConfigService.getConfigs();

        res.status(200).json(
            configs
        );

    } catch (error) {

        next(error);
    }
};


export const updateAIConfig = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const input =
            req.body as CreateAIConfigInput;

        const config =
            await aiConfigService.updateConfig(
                input
            );

        res.status(200).json(
            config
        );

    } catch (error) {

        next(error);
    }
};