import { Request, Response } from "express";
import { merchantService } from "../services/merchant.service";

class MerchantController {

    // Get All Merchants Controller 
    async getAll(req: Request, res: Response) {
        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;

        const q = req.query.q as string | undefined;
        const status = req.query.status as string | undefined;
        const platform = req.query.platform as string | undefined;
        const country = req.query.country as string | undefined;
        const industry = req.query.industry as string | undefined;
        const assignedRep = req.query.assigned_rep as string | undefined;
        const sort = req.query.sort as string | undefined;
        const direction = req.query.direction as string | undefined;

        const merchants = await merchantService.getAllMerchants(
            limit,
            offset,
            q,
            status,
            platform,
            country,
            industry,
            assignedRep,
            sort,
            direction
        );

        const total = await merchantService.countMerchants(
            q,
            status,
            platform,
            country,
            industry,
            assignedRep
        );

        res.status(200).json({
            data: merchants,
            pagination: {
                total,
                limit,
                offset,
            },
        });
    }

    // Get Merchants By Id Controller
    async getById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params;

        const merchant = await merchantService.getMerchantById(id);

        if (!merchant) {
            return res.status(404).json({
                message: "Merchant not found",
            });
        }

        res.status(200).json({
            data: merchant,
        });
    }

    // Create  Merchants  Controller
    async create(req: Request, res: Response) {
        try {
            const merchant = await merchantService.createMerchant(req.body);

            res.status(201).json({
                data: merchant,
            });
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "MERCHANT_DOMAIN_EXISTS"
            ) {
                return res.status(409).json({
                    message: "Merchant with this domain already exists",
                });
            }

            throw error;
        }
    }

    // Update Merchants Details Controller
    async update(
        req: Request<{ id: string }>,
        res: Response
    ) {
        const { id } = req.params;

        const merchant = await merchantService.updateMerchant(
            id,
            req.body,
            req.user!.id
        );

        if (!merchant) {
            return res.status(404).json({
                message: "Merchant not found",
            });
        }

        res.status(200).json({
            data: merchant,
        });
    }

    // Delete Merchants  Controller
    async delete(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params;

        const deleted = await merchantService.deleteMerchant(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Merchant not found",
            });
        }

        res.status(204).send();
    }
}

export const merchantController = new MerchantController();