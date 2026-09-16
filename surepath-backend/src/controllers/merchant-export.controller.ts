import { Request, Response } from "express";
import { merchantExportService } from "../services/merchant-export.service";

export const exportMerchants = async (
    req: Request,
    res: Response
) => {

    try {

        const filters = {
            q: req.query.q as string | undefined,

            status:
                req.query.status as string | undefined,

            platform:
                req.query.platform as string | undefined,

            country:
                req.query.country as string | undefined,

            industry:
                req.query.industry as string | undefined,

            assignedRep:
                req.query.assigned_rep as string | undefined,

            sort:
                req.query.sort as string | undefined,

            direction:
                req.query.direction as string | undefined,
        };

        /*
         * Tell browser/Postman this is a CSV file.
         */
        res.status(200);

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="merchants.csv"'
        );

        /*
         * Export and stream CSV.
         */
        await merchantExportService.exportMerchants(
            filters,
            res
        );

    } catch (error) {

        console.error(
            "Merchant export error:",
            error
        );

        if (!res.headersSent) {

            res.status(500).json({
                message: "Failed to export merchants",
            });

        } else {

            res.destroy(
                error instanceof Error
                    ? error
                    : undefined
            );
        }
    }
};