import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    industryService,
} from "../services/industry.service";

export const getIndustries = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const result =
            await industryService.getIndustries();

        res.status(200).json(result);

    } catch (error) {

        next(error);
    }
};