import { merchantTaskRepository } from "../repositories/merchant-task.repository";
import { merchantRepository } from "../repositories/merchant.repository";
import {
    CreateMerchantTaskData,
    TaskQueueFilters,
    UpdateMerchantTaskData,
} from "../types/merchant-task.types";

class MerchantTaskService {
    async getAll(filters: TaskQueueFilters = {}) {
        return merchantTaskRepository.findAll(filters);
    }

    async getByMerchantId(merchantId: string) {
        const merchant = await merchantRepository.findById(merchantId);

        if (!merchant) {
            return null;
        }

        return merchantTaskRepository.findByMerchantId(merchantId);
    }

    async getSummary(assignedTo?: string) {
        return merchantTaskRepository.getSummary(assignedTo);
    }

    async create(
        merchantId: string,
        data: CreateMerchantTaskData
    ) {
        const merchant = await merchantRepository.findById(merchantId);

        if (!merchant) {
            return null;
        }

        const title = data.title?.trim();

        if (!title) {
            throw new Error("TASK_TITLE_REQUIRED");
        }

        if (!data.created_by) {
            throw new Error("TASK_CREATED_BY_REQUIRED");
        }

        if (data.assigned_to_id) {
            const assignedUser = await this.validateUser(
                data.assigned_to_id
            );

            if (!assignedUser) {
                throw new Error("ASSIGNED_USER_NOT_FOUND");
            }
        }

        let dueAt: Date | undefined;

        if (data.due_at) {
            dueAt = new Date(data.due_at);

            if (Number.isNaN(dueAt.getTime())) {
                throw new Error("INVALID_DUE_AT");
            }
        }

        return merchantTaskRepository.create(
            merchantId,
            {
                ...data,
                title,
                due_at: dueAt,
            }
        );
    }

    async update(
        taskId: string,
        data: UpdateMerchantTaskData
    ) {
        const existingTask = await merchantTaskRepository.findById(taskId);

        if (!existingTask) {
            return null;
        }

        if (data.title !== undefined) {
            const title = data.title.trim();

            if (!title) {
                throw new Error("TASK_TITLE_REQUIRED");
            }

            data.title = title;
        }

        if (data.assigned_to_id) {
            const assignedUser = await this.validateUser(data.assigned_to_id);

            if (!assignedUser) {
                throw new Error("ASSIGNED_USER_NOT_FOUND");
            }
        }

        if (data.due_at !== undefined && data.due_at !== null) {
            const dueAt = new Date(data.due_at);

            if (Number.isNaN(dueAt.getTime())) {
                throw new Error("INVALID_DUE_AT");
            }

            data.due_at = dueAt;
        }

        return merchantTaskRepository.update(taskId, data);
    }


    async delete(taskId: string): Promise<boolean> {
        const existingTask = await merchantTaskRepository.findById(taskId);

        if (!existingTask) {
            return false;
        }

        return merchantTaskRepository.delete(taskId);
    }

    private async validateUser(userId: string) {
        const result = await import("../config/database").then(
            ({ pool }) =>
                pool.query(
                    `
          SELECT id
          FROM users
          WHERE id = $1
            AND is_active = TRUE
          `,
                    [userId]
                )
        );

        return result.rows[0] ?? null;
    }
}

export const merchantTaskService =
    new MerchantTaskService();