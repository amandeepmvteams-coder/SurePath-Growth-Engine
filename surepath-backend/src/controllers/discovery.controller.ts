import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    discoveryService,
} from "../services/discovery.service";

import {
    DiscoveryRunRequest,
} from "../types/discovery.types";

export const runDiscovery = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const input =
            req.body as DiscoveryRunRequest;

        const result =
            await discoveryService.runDiscovery(
                input
            );

        res.status(200).json(result);

    } catch (error) {

        next(error);

    }
};