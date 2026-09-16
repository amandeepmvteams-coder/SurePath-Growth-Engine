import { merchantContactRepository } from "../repositories/merchant-contact.repository";
import { merchantRepository } from "../repositories/merchant.repository";
import { CreateMerchantContactData } from "../types/merchant-contact.types";
import { withTransaction } from "../config/database";
import { UpdateMerchantContactData } from "../types/merchant-contact.types";
class MerchantContactService {
    async getByMerchantId(merchantId: string) {
        return merchantContactRepository.findByMerchantId(
            merchantId
        );
    }

    async create(
        merchantId: string,
        data: CreateMerchantContactData
    ) {
        const merchant =
            await merchantRepository.findById(merchantId);

        if (!merchant) {
            return null;
        }

        if (!data.email && !data.phone) {
            throw new Error("CONTACT_EMAIL_OR_PHONE_REQUIRED");
        }

        return withTransaction(async (client) => {
            if (data.is_primary === true) {
                await merchantContactRepository.unsetPrimaryContacts(
                    merchantId,
                    client
                );
            }

            return merchantContactRepository.create(
                merchantId,
                data,
                client
            );
        });
    }

    async update(
        merchantId: string,
        contactId: string,
        data: UpdateMerchantContactData
    ) {
        const merchant =
            await merchantRepository.findById(merchantId);

        if (!merchant) {
            return null;
        }

        const contacts =
            await merchantContactRepository.findByMerchantId(
                merchantId
            );

        const existingContact = contacts.find(
            (contact) => contact.id === contactId
        );

        if (!existingContact) {
            return null;
        }

        // If email and phone are both being removed,
        // reject the update.
        const newEmail =
            data.email !== undefined
                ? data.email
                : existingContact.email;

        const newPhone =
            data.phone !== undefined
                ? data.phone
                : existingContact.phone;

        if (!newEmail && !newPhone) {
            throw new Error("CONTACT_EMAIL_OR_PHONE_REQUIRED");
        }

        return withTransaction(async (client) => {
            if (data.is_primary === true) {
                await merchantContactRepository.unsetPrimaryContacts(
                    merchantId,
                    client
                );
            }

            return merchantContactRepository.update(
                merchantId,
                contactId,
                data,
                client
            );
        });
    }

    async delete(
        merchantId: string,
        contactId: string
    ) {
        const merchant =
            await merchantRepository.findById(merchantId);

        if (!merchant) {
            return null;
        }

        const deleted =
            await merchantContactRepository.delete(
                merchantId,
                contactId
            );

        return deleted;
    }
}

export const merchantContactService =
    new MerchantContactService();