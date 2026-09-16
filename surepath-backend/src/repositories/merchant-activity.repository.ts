import { pool } from "../config/database";
import {
  MerchantActivity,
  CreateMerchantActivityData,
} from "../types/merchant-activity.types";

class MerchantActivityRepository {

  async findByMerchantId(
    merchantId: string,
    outreachOnly: boolean = false
  ): Promise<MerchantActivity[]> {

    const conditions = [
      "a.merchant_id = $1"
    ];

    const values: unknown[] = [merchantId];

    if (outreachOnly) {
      conditions.push("a.activity_type = $2");
      values.push("Outreach");
    }

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.merchant_id,
        a.activity_type,
        a.direction,
        a.channel,
        a.subject,
        a.body,
        a.detail,
        a.occurred_at,

        a.logged_by AS logged_by_id,

        CASE
          WHEN u.id IS NOT NULL THEN
            json_build_object(
              'id', u.id,
              'username', u.username,
              'display_name', u.display_name
            )
          ELSE NULL
        END AS logged_by,

        a.created_at

      FROM merchant_activities a

      LEFT JOIN users u
        ON a.logged_by = u.id

      WHERE ${conditions.join(" AND ")}

      ORDER BY a.occurred_at DESC
      `,
      values
    );

    return result.rows;
  }

  async create(
    merchantId: string,
    data: CreateMerchantActivityData
  ): Promise<MerchantActivity> {

    const result = await pool.query(
      `
      INSERT INTO merchant_activities (
        merchant_id,
        activity_type,
        direction,
        channel,
        subject,
        body,
        detail,
        occurred_at,
        logged_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING
        id,
        merchant_id,
        activity_type,
        direction,
        channel,
        subject,
        body,
        detail,
        occurred_at,
        logged_by AS logged_by_id,
        created_at
      `,
      [
        merchantId,
        data.activity_type,
        data.direction ?? null,
        data.channel ?? null,
        data.subject ?? null,
        data.body ?? null,
        data.detail ?? null,
        data.occurred_at,
        data.logged_by ?? null,
      ]
    );

    const activityId = result.rows[0].id;

    const activityResult = await pool.query(
      `
      SELECT
        a.id,
        a.merchant_id,
        a.activity_type,
        a.direction,
        a.channel,
        a.subject,
        a.body,
        a.detail,
        a.occurred_at,

        a.logged_by AS logged_by_id,

        CASE
          WHEN u.id IS NOT NULL THEN
            json_build_object(
              'id', u.id,
              'username', u.username,
              'display_name', u.display_name
            )
          ELSE NULL
        END AS logged_by,

        a.created_at

      FROM merchant_activities a

      LEFT JOIN users u
        ON a.logged_by = u.id

      WHERE a.id = $1
      `,
      [activityId]
    );

    return activityResult.rows[0];
  }
}

export const merchantActivityRepository =
  new MerchantActivityRepository();