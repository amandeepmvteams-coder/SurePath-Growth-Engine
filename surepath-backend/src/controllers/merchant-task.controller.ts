import { Request, Response } from "express";
import { merchantTaskService } from "../services/merchant-task.service";
import { CreateMerchantTaskData, UpdateMerchantTaskData } from "../types/merchant-task.types";

class MerchantTaskController {
    async getAll(
        req: Request<
            {},
            {},
            {},
            {
                assigned_to?: string;
                merchant_id?: string;
                open_only?: string;
                due_before?: string;
                limit?: string;
            }
        >,
        res: Response
    ) {
        const assignedTo = req.query.assigned_to;

        const merchantId = req.query.merchant_id;

        const openOnly =
            req.query.open_only === undefined
                ? true
                : req.query.open_only === "true";

        const dueBefore = req.query.due_before
            ? new Date(req.query.due_before)
            : undefined;

        const limit = req.query.limit
            ? Number(req.query.limit)
            : 100;

        const tasks =
            await merchantTaskService.getAll({
                assigned_to: assignedTo,
                merchant_id: merchantId,
                open_only: openOnly,
                due_before: dueBefore,
                limit,
            });

        return res.status(200).json(tasks);
    }

    async getByMerchantId(
        req: Request<{ id: string }>,
        res: Response
    ) {
        const { id } = req.params;

        const tasks =
            await merchantTaskService.getByMerchantId(id);

        if (tasks === null) {
            return res.status(404).json({
                message: "Merchant not found",
            });
        }

        return res.status(200).json(tasks);
    }

    async getSummary(
        req: Request<
            {},
            {},
            {},
            {
                assigned_to?: string;
            }
        >,
        res: Response
    ) {
        const assignedTo = req.query.assigned_to;

        const summary =
            await merchantTaskService.getSummary(assignedTo);

        return res.status(200).json(summary);
    }

    async create(
        req: Request<
            { id: string },
            {},
            {
                title: string;
                notes?: string;
                assigned_to_id?: string;
                due_at?: string;
                created_by?: string;
            }
        >,
        res: Response
    ) {
        const { id } = req.params;

        try {
            const data: CreateMerchantTaskData = {
                title: req.body.title,
                notes: req.body.notes,
                assigned_to_id: req.body.assigned_to_id,
                due_at: req.body.due_at
                    ? new Date(req.body.due_at)
                    : undefined,

                // Use the authenticated user.
                created_by: req.user?.id as string,
            };

            const task =
                await merchantTaskService.create(id, data);

            if (task === null) {
                return res.status(404).json({
                    message: "Merchant not found",
                });
            }

            return res.status(201).json(task);

        } catch (error) {

            if (!(error instanceof Error)) {
                throw error;
            }

            switch (error.message) {

                case "TASK_TITLE_REQUIRED":
                    return res.status(400).json({
                        message: "Title is required",
                    });

                case "TASK_CREATED_BY_REQUIRED":
                    return res.status(400).json({
                        message: "Created by is required",
                    });

                case "ASSIGNED_USER_NOT_FOUND":
                    return res.status(400).json({
                        message: "Assigned user not found or inactive",
                    });

                case "INVALID_DUE_AT":
                    return res.status(400).json({
                        message: "Due at must be a valid timestamp",
                    });

                default:
                    throw error;
            }
        }
    }

    async update(
        req: Request<
            { id: string },
            {},
            {
                title?: string;
                notes?: string;
                assigned_to_id?: string | null;
                due_at?: string | null;
                completed?: boolean;
            }
        >,
        res: Response
    ) {
        const { id } = req.params;

        try {
            const data: UpdateMerchantTaskData = {
                title: req.body.title,
                notes: req.body.notes,
                assigned_to_id: req.body.assigned_to_id,
                due_at:
                    req.body.due_at !== undefined && req.body.due_at !== null
                        ? new Date(req.body.due_at)
                        : req.body.due_at,
                completed: req.body.completed,
            };

            const task = await merchantTaskService.update(id, data);

            if (task === null) {
                return res.status(404).json({
                    message: "Task not found",
                });
            }

            return res.status(200).json(task);
        } catch (error) {
            if (!(error instanceof Error)) throw error;

            switch (error.message) {
                case "TASK_TITLE_REQUIRED":
                    return res.status(400).json({
                        message: "Title cannot be empty",
                    });

                case "ASSIGNED_USER_NOT_FOUND":
                    return res.status(400).json({
                        message: "Assigned user not found or inactive",
                    });

                case "INVALID_DUE_AT":
                    return res.status(400).json({
                        message: "Due at must be a valid timestamp",
                    });

                default:
                    throw error;
            }
        }
    }

    async delete(
        req: Request<{ id: string }>,
        res: Response
    ) {
        const { id } = req.params;

        const deleted = await merchantTaskService.delete(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        return res.status(204).send();
    }
}

export const merchantTaskController =
    new MerchantTaskController();