import { Request, Response } from "express";
import { merchantNoteService } from "../services/merchant-note.service";
import { CreateMerchantNoteData } from "../types/merchant-note.types";

class MerchantNoteController {
    async getByMerchantId(
        req: Request<{ id: string }>,
        res: Response
    ) {
        const { id } = req.params;

        const notes =
            await merchantNoteService.getByMerchantId(id);

        return res.status(200).json(notes);
    }

    async create(
        req: Request<
            { id: string },
            {},
            { body: string }
        >,
        res: Response
    ) {
        const { id } = req.params;

        try {
            const data: CreateMerchantNoteData = {
                body: req.body.body,
                author_id: req.user?.id,
            };

            const note =
                await merchantNoteService.create(
                    id,
                    data
                );

            if (!note) {
                return res.status(404).json({
                    message: "Merchant not found",
                });
            }

            return res.status(201).json(note);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "NOTE_BODY_REQUIRED"
            ) {
                return res.status(400).json({
                    message: "Note body is required",
                });
            }

            throw error;
        }
    }

    async delete(
        req: Request<{ id: string; note_id: string }>,
        res: Response
    ) {
        const { id, note_id } = req.params;

        const result =
            await merchantNoteService.delete(
                id,
                note_id
            );

        if (result === null) {
            return res
                .status(404)
                .json({
                    message: "Merchant not found"
                });
        }

        if (!result) {
            return res
                .status(404)
                .json({
                    message: "Note not found"
                });
        }

        return res.status(204).send();
    }
}

export const merchantNoteController =
    new MerchantNoteController();