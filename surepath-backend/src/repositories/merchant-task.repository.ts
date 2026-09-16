import { pool } from "../config/database";
import {
    MerchantTask,
    CreateMerchantTaskData,
    TaskQueueFilters,
    MerchantTaskSummary,
    UpdateMerchantTaskData,
} from "../types/merchant-task.types";



class MerchantTaskRepository {

    async findByMerchantId(
        merchantId: string
    ): Promise<MerchantTask[]> {

        const result = await pool.query(
            `
      SELECT
        t.id,
        t.merchant_id,

        m.domain AS merchant_domain,
        m.store_name AS merchant_store_name,

        t.assigned_to_id,

        CASE
          WHEN u.id IS NOT NULL THEN
            json_build_object(
              'id', u.id,
              'username', u.username,
              'display_name', u.display_name
            )
          ELSE NULL
        END AS assigned_to,

        t.title,
        t.notes,
        t.due_at,
        t.completed_at,
        t.created_by,
        t.created_at

      FROM merchant_tasks t

      INNER JOIN merchants m
        ON t.merchant_id = m.id

      LEFT JOIN users u
        ON t.assigned_to_id = u.id

      WHERE t.merchant_id = $1

      ORDER BY
        t.due_at ASC NULLS LAST,
        t.created_at DESC
      `,
            [merchantId]
        );

        return result.rows;
    }

    async findAll(
        filters: TaskQueueFilters = {}
    ): Promise<MerchantTask[]> {

        const conditions: string[] = [];
        const values: unknown[] = [];

        /*
         * Filter by assigned user
         */
        if (filters.assigned_to) {

            if (filters.assigned_to === "unassigned") {
                conditions.push("t.assigned_to_id IS NULL");
            } else {
                values.push(filters.assigned_to);

                conditions.push(
                    `t.assigned_to_id = $${values.length}`
                );
            }
        }

        /*
         * Filter by merchant
         */
        if (filters.merchant_id) {
            values.push(filters.merchant_id);

            conditions.push(
                `t.merchant_id = $${values.length}`
            );
        }

        /*
         * Hide completed tasks
         *
         * Swagger says open_only defaults to true.
         */
        if (filters.open_only === true) {
            conditions.push("t.completed_at IS NULL");
        }

        /*
         * Filter tasks due before a specific timestamp
         */
        if (filters.due_before) {
            values.push(filters.due_before);

            conditions.push(
                `t.due_at < $${values.length}`
            );
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        /*
         * Limit
         *
         * PostgreSQL does not allow us to pass a value
         * directly into LIMIT in every dynamically-built
         * situation we want, so we add it as a parameter.
         */
        const limit = filters.limit ?? 100;

        values.push(limit);

        const limitPlaceholder = `$${values.length}`;

        const result = await pool.query(
            `
    SELECT
      t.id,
      t.merchant_id,

      m.domain AS merchant_domain,
      m.store_name AS merchant_store_name,

      t.assigned_to_id,

      CASE
        WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'username', u.username,
            'display_name', u.display_name
          )
        ELSE NULL
      END AS assigned_to,

      t.title,
      t.notes,
      t.due_at,
      t.completed_at,
      t.created_by,
      t.created_at

    FROM merchant_tasks t

    INNER JOIN merchants m
      ON t.merchant_id = m.id

    LEFT JOIN users u
      ON t.assigned_to_id = u.id

    ${whereClause}

    ORDER BY
      t.due_at ASC NULLS LAST,
      t.created_at DESC

    LIMIT ${limitPlaceholder}
    `,
            values
        );

        return result.rows;
    }

    async create(
        merchantId: string,
        data: CreateMerchantTaskData
    ): Promise<MerchantTask> {

        const result = await pool.query(
            `
      INSERT INTO merchant_tasks (
        merchant_id,
        assigned_to_id,
        title,
        notes,
        due_at,
        created_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING id
      `,
            [
                merchantId,
                data.assigned_to_id ?? null,
                data.title,
                data.notes ?? null,
                data.due_at ?? null,
                data.created_by,
            ]
        );

        const taskId = result.rows[0].id;

        const taskResult = await pool.query(
            `
      SELECT
        t.id,
        t.merchant_id,

        m.domain AS merchant_domain,
        m.store_name AS merchant_store_name,

        t.assigned_to_id,

        CASE
          WHEN u.id IS NOT NULL THEN
            json_build_object(
              'id', u.id,
              'username', u.username,
              'display_name', u.display_name
            )
          ELSE NULL
        END AS assigned_to,

        t.title,
        t.notes,
        t.due_at,
        t.completed_at,
        t.created_by,
        t.created_at

      FROM merchant_tasks t

      INNER JOIN merchants m
        ON t.merchant_id = m.id

      LEFT JOIN users u
        ON t.assigned_to_id = u.id

      WHERE t.id = $1
      `,
            [taskId]
        );

        return taskResult.rows[0];
    }

    async getSummary(assignedTo?: string): Promise<MerchantTaskSummary> {
        let whereClause = "";
        const params: string[] = [];

        if (assignedTo === "unassigned") {
            whereClause = `WHERE assigned_to_id IS NULL`;
        } else if (assignedTo) {
            whereClause = `WHERE assigned_to_id = $1`;
            params.push(assignedTo);
        }

        const result = await pool.query(
            `
    SELECT
      COUNT(*) FILTER (
        WHERE completed_at IS NULL
      ) AS open,
      COUNT(*) FILTER (
        WHERE completed_at IS NULL
          AND due_at IS NOT NULL
          AND due_at < NOW()
      ) AS overdue,
      COUNT(*) FILTER (
        WHERE completed_at IS NULL
          AND due_at IS NOT NULL
          AND due_at >= CURRENT_DATE
          AND due_at < CURRENT_DATE + INTERVAL '1 day'
      ) AS due_today,
      COUNT(*) FILTER (
        WHERE completed_at IS NULL
          AND due_at IS NULL
      ) AS undated
    FROM merchant_tasks
    ${whereClause}
    `,
            params
        );

        const row = result.rows[0];

        return {
            open: Number(row.open),
            overdue: Number(row.overdue),
            due_today: Number(row.due_today),
            undated: Number(row.undated),
        };
    }

    async findById(taskId: string): Promise<MerchantTask | null> {
        const result = await pool.query(
            `
    SELECT
      t.id,
      t.merchant_id,
      m.domain AS merchant_domain,
      m.store_name AS merchant_store_name,
      t.assigned_to_id,
      CASE
        WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'username', u.username,
            'display_name', u.display_name
          )
        ELSE NULL
      END AS assigned_to,
      t.title,
      t.notes,
      t.due_at,
      t.completed_at,
      t.created_by,
      t.created_at
    FROM merchant_tasks t
    JOIN merchants m
      ON m.id = t.merchant_id
    LEFT JOIN users u
      ON u.id = t.assigned_to_id
    WHERE t.id = $1
    `,
            [taskId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            ...row,
            assigned_to: row.assigned_to
                ? {
                    id: row.assigned_to.id,
                    username: row.assigned_to.username,
                    display_name: row.assigned_to.display_name,
                }
                : null,
        };
    }

    async update(
        taskId: string,
        data: UpdateMerchantTaskData
    ): Promise<MerchantTask | null> {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (data.title !== undefined) {
            fields.push(`title = $${values.length + 1}`);
            values.push(data.title);
        }

        if (data.notes !== undefined) {
            fields.push(`notes = $${values.length + 1}`);
            values.push(data.notes);
        }

        if (data.assigned_to_id !== undefined) {
            fields.push(`assigned_to_id = $${values.length + 1}`);
            values.push(data.assigned_to_id);
        }

        if (data.due_at !== undefined) {
            fields.push(`due_at = $${values.length + 1}`);
            values.push(data.due_at);
        }

        if (data.completed !== undefined) {
            if (data.completed) {
                fields.push(`completed_at = NOW()`);
            } else {
                fields.push(`completed_at = NULL`);
            }
        }

        if (fields.length === 0) {
            return this.findById(taskId);
        }

        values.push(taskId);

        const result = await pool.query(
            `
    UPDATE merchant_tasks
    SET ${fields.join(", ")}
    WHERE id = $${values.length}
    RETURNING id
    `,
            values
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.findById(taskId);
    }

    async delete(taskId: string): Promise<boolean> {
        const result = await pool.query(
            `
    DELETE FROM merchant_tasks
    WHERE id = $1
    `,
            [taskId]
        );

        return result.rowCount === 1;
    }
}

export const merchantTaskRepository =
    new MerchantTaskRepository();