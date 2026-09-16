import { merchantActivityRepository } from "../repositories/merchant-activity.repository";
import { merchantRepository } from "../repositories/merchant.repository";
import { CreateMerchantActivityData } from "../types/merchant-activity.types";
import { pool } from "../config/database";

class MerchantActivityService {
  private readonly allowedActivityTypes = [
    "Call",
    "Email",
    "Meeting",
    "Outreach",
  ];

  async getByMerchantId(
    merchantId: string,
    outreachOnly: boolean = false
  ) {
    const merchant = await merchantRepository.findById(merchantId);

    if (!merchant) {
      return null;
    }

    return merchantActivityRepository.findByMerchantId(
      merchantId,
      outreachOnly
    );
  }

  async create(
    merchantId: string,
    data: CreateMerchantActivityData
  ) {
    const merchant = await merchantRepository.findById(merchantId);

    if (!merchant) {
      return null;
    }

    const activityType = data.activity_type?.trim();

    if (!activityType) {
      throw new Error("ACTIVITY_TYPE_REQUIRED");
    }

    if (!this.allowedActivityTypes.includes(activityType)) {
      throw new Error("INVALID_ACTIVITY_TYPE");
    }

    const subject = data.subject?.trim() || null;
    const body = data.body?.trim() || null;

    if (!subject && !body) {
      throw new Error("ACTIVITY_SUBJECT_OR_BODY_REQUIRED");
    }

    if (!data.occurred_at) {
      throw new Error("OCCURRED_AT_REQUIRED");
    }

    const occurredAt = new Date(data.occurred_at);

    if (Number.isNaN(occurredAt.getTime())) {
      throw new Error("INVALID_OCCURRED_AT");
    }

    if (occurredAt.getTime() > Date.now()) {
      throw new Error("FUTURE_OCCURRED_AT");
    }

    const activityData: CreateMerchantActivityData = {
      ...data,
      activity_type: activityType,
      subject: subject ?? undefined,
      body: body ?? undefined,
    };

    const activity = await merchantActivityRepository.create(
      merchantId,
      activityData
    );

    if (activityType === "Outreach") {
      await pool.query(
        `
        UPDATE merchants
        SET
          last_activity_at = $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [occurredAt, merchantId]
      );
    }

    return activity;
  }
}

export const merchantActivityService =
  new MerchantActivityService();