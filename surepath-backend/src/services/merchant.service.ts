import {
    CreateMerchantData,
    UpdateMerchantData,
} from "../types/merchant.types";
import { withTransaction } from "../config/database";
import { merchantRepository } from "../repositories/merchant.repository";
import { merchantStatusHistoryRepository } from "../repositories/merchant-status-history.repository";

class MerchantService {
    async getAllMerchants(
        limit = 20,
        offset = 0,
        q?: string,
        status?: string,
        platform?: string,
        country?: string,
        industry?: string,
        assignedRep?: string,
        sort = "created_at",
        direction = "desc"
    ) {
        return merchantRepository.findAll(
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
    }

    async getMerchantById(id: string) {
        return merchantRepository.findById(id);
    }

    async createMerchant(data: CreateMerchantData) {
        const normalizedDomain = this.normalizeDomain(data.domain);

        const existingMerchant =
            await merchantRepository.findByDomain(normalizedDomain);

        if (existingMerchant) {
            throw new Error("MERCHANT_DOMAIN_EXISTS");
        }

        return merchantRepository.create({
            ...data,
            domain: normalizedDomain,
        });
    }

    async updateMerchant(
        id: string,
        data: UpdateMerchantData,
        changedBy: string
    ) {
        const existingMerchant = await merchantRepository.findById(id);

        if (!existingMerchant) {
            return null;
        }

        const statusChanged =
            data.status !== undefined &&
            data.status !== existingMerchant.status;

        const updateData: UpdateMerchantData = {
            ...data,
        };

        // Preserve the original outcome information
        if (existingMerchant.outcome_at) {
            updateData.outcome_reason = existingMerchant.outcome_reason;
            updateData.outcome_at = existingMerchant.outcome_at;
        }

        // Record outcome timestamp when merchant first reaches
        // Live or Lost.
        if (
            statusChanged &&
            (data.status === "Live" || data.status === "Lost") &&
            !existingMerchant.outcome_at
        ) {
            updateData.outcome_at = new Date();
        }

        return withTransaction(async (client) => {
            const updatedMerchant = await merchantRepository.update(
                id,
                updateData,
                client
            );

            if (!updatedMerchant) {
                return null;
            }

            if (statusChanged) {
                await merchantStatusHistoryRepository.create(
                    {
                        merchant_id: id,
                        from_status: existingMerchant.status,
                        to_status: data.status as string,
                        changed_by: changedBy,
                    },
                    client
                );
            }

            return updatedMerchant;
        });
    }

    async deleteMerchant(id: string) {
        return merchantRepository.delete(id);
    }

    async countMerchants(
        q?: string,
        status?: string,
        platform?: string,
        country?: string,
        industry?: string,
        assignedRep?: string
    ) {
        return merchantRepository.count(
            q,
            status,
            platform,
            country,
            industry,
            assignedRep
        );
    }

    private normalizeDomain(domain: string): string {
        let normalized = domain.trim().toLowerCase();

        if (
            !normalized.startsWith("http://") &&
            !normalized.startsWith("https://")
        ) {
            normalized = `https://${normalized}`;
        }

        const url = new URL(normalized);

        return url.hostname.replace(/^www\./, "");
    }
}

export const merchantService = new MerchantService();