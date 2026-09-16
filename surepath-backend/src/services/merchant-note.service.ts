import { merchantNoteRepository } from "../repositories/merchant-note.repository";
import { merchantRepository } from "../repositories/merchant.repository";
import { CreateMerchantNoteData } from "../types/merchant-note.types";

class MerchantNoteService {
    async getByMerchantId(merchantId: string) {
        return merchantNoteRepository.findByMerchantId(
            merchantId
        );
    }

    async create(
        merchantId: string,
        data: CreateMerchantNoteData
    ) {
        const merchant =
            await merchantRepository.findById(merchantId);

        if (!merchant) {
            return null;
        }

        if (!data.body || !data.body.trim()) {
            throw new Error("NOTE_BODY_REQUIRED");
        }

        return merchantNoteRepository.create(
            merchantId,
            {
                ...data,
                body: data.body.trim(),
            }
        );
    }

    async delete(
        merchantId: string,
        noteId: string
    ) {
        const merchant =
            await merchantRepository.findById(merchantId);

        if (!merchant) {
            return null;
        }

        return merchantNoteRepository.delete(
            merchantId,
            noteId
        );
    }
}

export const merchantNoteService =
    new MerchantNoteService();