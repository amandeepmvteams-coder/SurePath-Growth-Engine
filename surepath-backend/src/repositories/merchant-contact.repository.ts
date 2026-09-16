import { pool } from "../config/database";
import { PoolClient } from "pg";
import {
  MerchantContact,
  CreateMerchantContactData,
  UpdateMerchantContactData,
} from "../types/merchant-contact.types";

class MerchantContactRepository {
  async findByMerchantId(
    merchantId: string
  ): Promise<MerchantContact[]> {
    const result = await pool.query(
      `
      SELECT
        c.id,
        c.merchant_id,
        c.name,
        c.role,
        c.email,
        c.phone,
        c.is_primary,
        c.owner_id,

        CASE
          WHEN u.id IS NOT NULL THEN
            json_build_object(
              'id', u.id,
              'username', u.username,
              'display_name', u.display_name
            )
          ELSE NULL
        END AS owner,

        c.source,
        c.confidence,
        c.verified_at,
        c.is_manual_override,
        c.created_by,
        c.created_at,
        c.updated_at

      FROM merchant_contacts c

      LEFT JOIN users u
        ON c.owner_id = u.id

      WHERE c.merchant_id = $1

      ORDER BY c.is_primary DESC, c.created_at DESC
      `,
      [merchantId]
    );

    return result.rows;
  }

  async create(
    merchantId: string,
    data: CreateMerchantContactData,
    client?: PoolClient
  ): Promise<MerchantContact> {
    const db = client ?? pool;

    const result = await db.query(
      `
    INSERT INTO merchant_contacts (
      merchant_id,
      name,
      role,
      email,
      phone,
      is_primary,
      owner_id,
      created_by
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    )
    RETURNING id
    `,
      [
        merchantId,
        data.name,
        data.role ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.is_primary ?? false,
        data.owner_id ?? null,
        data.created_by,
      ]
    );

    const contactId = result.rows[0].id;

    const contactResult = await db.query(
      `
    SELECT
      c.id,
      c.merchant_id,
      c.name,
      c.role,
      c.email,
      c.phone,
      c.is_primary,
      c.owner_id,

      CASE
        WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'username', u.username,
            'display_name', u.display_name
          )
        ELSE NULL
      END AS owner,

      c.source,
      c.confidence,
      c.verified_at,
      c.is_manual_override,
      c.created_by,
      c.created_at,
      c.updated_at

    FROM merchant_contacts c

    LEFT JOIN users u
      ON c.owner_id = u.id

    WHERE c.id = $1
    `,
      [contactId]
    );

    return contactResult.rows[0];
  }

  async unsetPrimaryContacts(
    merchantId: string,
    client?: PoolClient
  ): Promise<void> {
    const db = client ?? pool;

    await db.query(
      `
    UPDATE merchant_contacts
    SET
      is_primary = FALSE,
      updated_at = NOW()
    WHERE merchant_id = $1
      AND is_primary = TRUE
    `,
      [merchantId]
    );
  }

  async update(
    merchantId: string,
    contactId: string,
    data: UpdateMerchantContactData,
    client?: PoolClient
  ): Promise<MerchantContact | null> {
    const db = client ?? pool;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      values.push(data.name);
      fields.push(`name = $${values.length}`);
    }

    if (data.role !== undefined) {
      values.push(data.role);
      fields.push(`role = $${values.length}`);
    }

    if (data.email !== undefined) {
      values.push(data.email);
      fields.push(`email = $${values.length}`);
    }

    if (data.phone !== undefined) {
      values.push(data.phone);
      fields.push(`phone = $${values.length}`);
    }

    if (data.is_primary !== undefined) {
      values.push(data.is_primary);
      fields.push(`is_primary = $${values.length}`);
    }

    if (data.created_by !== undefined) {
      values.push(data.created_by);
      fields.push(`created_by = $${values.length}`);
    }

    if (data.owner_id !== undefined) {
      values.push(data.owner_id);
      fields.push(`owner_id = $${values.length}`);
    }

    // Every edit becomes a manual override
    fields.push("is_manual_override = TRUE");
    fields.push("updated_at = NOW()");

    values.push(merchantId);
    const merchantIdIndex = values.length;

    values.push(contactId);
    const contactIdIndex = values.length;

    const result = await db.query(
      `
    UPDATE merchant_contacts
    SET ${fields.join(", ")}
    WHERE merchant_id = $${merchantIdIndex}
      AND id = $${contactIdIndex}
    RETURNING id
    `,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const contactResult = await db.query(
      `
    SELECT
      c.id,
      c.merchant_id,
      c.name,
      c.role,
      c.email,
      c.phone,
      c.is_primary,
      c.owner_id,

      CASE
        WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'username', u.username,
            'display_name', u.display_name
          )
        ELSE NULL
      END AS owner,

      c.source,
      c.confidence,
      c.verified_at,
      c.is_manual_override

    FROM merchant_contacts c

    LEFT JOIN users u
      ON c.owner_id = u.id

    WHERE c.id = $1
    `,
      [contactId]
    );

    return contactResult.rows[0] ?? null;
  }

  async delete(
    merchantId: string,
    contactId: string
  ): Promise<boolean> {
    const result = await pool.query(
      `
    DELETE FROM merchant_contacts
    WHERE merchant_id = $1
      AND id = $2
    `,
      [merchantId, contactId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  async hasContact(merchantId: string): Promise<boolean> {
    const result = await pool.query(
      `
    SELECT 1
    FROM merchant_contacts
    WHERE merchant_id = $1
    LIMIT 1
    `,
      [merchantId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  async createFromResearch(
    merchantId: string,
    data: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      role?: string | null;
      is_primary?: boolean;
      source?: string | null;
      confidence?: number | null;
    },
    client?: PoolClient
  ): Promise<MerchantContact> {
    const db = client ?? pool;

    const result = await db.query(
      `
    INSERT INTO merchant_contacts (
      merchant_id,
      name,
      role,
      email,
      phone,
      is_primary,
      source,
      confidence,
      is_manual_override,
      created_by
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
      FALSE,
      NULL
    )
    RETURNING id
    `,
      [
        merchantId,
        data.name ?? "Unknown",
        data.role ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.is_primary ?? false,
        data.source ?? "research",
        data.confidence ?? null,
      ]
    );

    const contactId = result.rows[0].id;

    const contactResult = await db.query(
      `
    SELECT
      c.id,
      c.merchant_id,
      c.name,
      c.role,
      c.email,
      c.phone,
      c.is_primary,
      c.owner_id,

      CASE
        WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'username', u.username,
            'display_name', u.display_name
          )
        ELSE NULL
      END AS owner,

      c.source,
      c.confidence,
      c.verified_at,
      c.is_manual_override,
      c.created_by,
      c.created_at,
      c.updated_at

    FROM merchant_contacts c

    LEFT JOIN users u
      ON c.owner_id = u.id

    WHERE c.id = $1
    `,
      [contactId]
    );

    return contactResult.rows[0];
  }

  async findResearchContact(
    merchantId: string,
    email?: string | null,
    phone?: string | null
  ): Promise<MerchantContact | null> {
    const result = await pool.query(
      `
    SELECT
      c.id,
      c.merchant_id,
      c.name,
      c.role,
      c.email,
      c.phone,
      c.is_primary,
      c.owner_id,

      CASE
        WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'username', u.username,
            'display_name', u.display_name
          )
        ELSE NULL
      END AS owner,

      c.source,
      c.confidence,
      c.verified_at,
      c.is_manual_override,
      c.created_by,
      c.created_at,
      c.updated_at

    FROM merchant_contacts c

    LEFT JOIN users u
      ON c.owner_id = u.id

    WHERE c.merchant_id = $1
      AND (
        ($2::text IS NOT NULL AND c.email = $2)
        OR
        ($3::text IS NOT NULL AND c.phone = $3)
      )
    LIMIT 1
    `,
      [
        merchantId,
        email ?? null,
        phone ?? null,
      ]
    );

    return result.rows[0] ?? null;
  }
}

export const merchantContactRepository =
  new MerchantContactRepository();