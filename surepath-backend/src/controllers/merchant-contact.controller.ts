import { Request, Response } from "express";
import { merchantContactService } from "../services/merchant-contact.service";
import { CreateMerchantContactData, UpdateMerchantContactData } from "../types/merchant-contact.types";

class MerchantContactController {
    async getByMerchantId(
        req: Request<{ id: string }>,
        res: Response
    ) {
        const { id } = req.params;

        const contacts =
            await merchantContactService.getByMerchantId(id);

        return res.status(200).json(contacts);
    }

    async create(
        req: Request<
            { id: string },
            {},
            CreateMerchantContactData
        >,
        res: Response
    ) {
        const { id } = req.params;

        try {
            const contact =
                await merchantContactService.create(
                    id,
                    req.body
                );

            if (!contact) {
                return res.status(404).json({
                    message: "Merchant not found",
                });
            }

            return res.status(201).json(contact);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                "CONTACT_EMAIL_OR_PHONE_REQUIRED"
            ) {
                return res.status(400).json({
                    message: "Contact must have an email or phone",
                });
            }

            throw error;
        }
    }

    async update(
        req: Request<
            { id: string; contact_id: string },
            {},
            UpdateMerchantContactData
        >,
        res: Response
    ) {
        const { id, contact_id } = req.params;

        try {
            const contact =
                await merchantContactService.update(
                    id,
                    contact_id,
                    req.body
                );

            if (!contact) {
                return res.status(404).json({
                    message: "Merchant or contact not found",
                });
            }

            return res.status(200).json(contact);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                "CONTACT_EMAIL_OR_PHONE_REQUIRED"
            ) {
                return res.status(400).json({
                    message: "Contact must have an email or phone",
                });
            }

            throw error;
        }
    }
    
    async delete(
  req: Request<
    { id: string; contact_id: string }
  >,
  res: Response
) {
  const { id, contact_id } = req.params;

  const result =
    await merchantContactService.delete(
      id,
      contact_id
    );

  if (result === null) {
    return res.status(404).json({
      message: "Merchant not found",
    });
  }

  if (!result) {
    return res.status(404).json({
      message: "Contact not found",
    });
  }

  return res.status(204).send();
}
}

export const merchantContactController =
    new MerchantContactController();