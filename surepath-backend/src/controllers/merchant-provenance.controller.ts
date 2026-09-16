import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    provenanceService
} from "../services/merchant-provenance.service";

export const getMerchantProvenance = async (
    req: Request<{ merchant_id: string }>,
    res: Response,
    next: NextFunction
) => {

    try {

        const { merchant_id } = req.params;

        const currentOnly =
            req.query.current_only === "true";

        const provenance =
            await provenanceService.getMerchantProvenance(
                merchant_id,
                currentOnly
            );

        res.status(200).json(provenance);

    } catch (error) {

        next(error);

    }
};