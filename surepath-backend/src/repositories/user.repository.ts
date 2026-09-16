import { pool } from "../config/database";
import { UpdateUserData, User } from "../types/user.types";

export const userRepository = {

    // Find All Users Query 
    async findAll(): Promise<User[]> {
        const result = await pool.query(
            `SELECT *
       FROM users
       ORDER BY created_at DESC`
        );

        return result.rows;
    },

    // Find User By Id Query 
    async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT *
       FROM users
       WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    },

    // Find User By Username Query 
    async findByUsername(username: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT *
       FROM users
       WHERE username = $1`,
            [username]
        );

        return result.rows[0] || null;
    },

    // Create Users Query
    async createUser(
        username: string,
        displayName: string | null,
        email: string | null,
        passwordHash: string,
        role: string
    ): Promise<User> {
        const result = await pool.query(
            `INSERT INTO users
        (username, display_name, email, password_hash, role)
       VALUES
        ($1, $2, $3, $4, $5)
       RETURNING *`,
            [username, displayName, email, passwordHash, role]
        );

        return result.rows[0];
    },

    // Find All Active Users  Query
    async findAllActive(): Promise<User[]> {
        const result = await pool.query(
            `SELECT *
             FROM users
             WHERE is_active = true
             ORDER BY created_at DESC`
        );

        return result.rows;
    },

    // Update User Details Query
    async updateUser(
        id: string,
        data: UpdateUserData
    ): Promise<User | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let parameterIndex = 1;

        if (data.display_name !== undefined) {
            fields.push(`display_name = $${parameterIndex}`);
            values.push(data.display_name);
            parameterIndex++;
        }

        if (data.email !== undefined) {
            fields.push(`email = $${parameterIndex}`);
            values.push(data.email);
            parameterIndex++;
        }

        if (data.role !== undefined) {
            fields.push(`role = $${parameterIndex}`);
            values.push(data.role);
            parameterIndex++;
        }

        if (data.is_active !== undefined) {
            fields.push(`is_active = $${parameterIndex}`);
            values.push(data.is_active);
            parameterIndex++;
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push(`updated_at = NOW()`);

        values.push(id);

        const result = await pool.query(
            `UPDATE users
     SET ${fields.join(", ")}
     WHERE id = $${parameterIndex}
     RETURNING *`,
            values
        );

        return result.rows[0] || null;
    },

    // Count Active User Query 
    async countActiveUsers(): Promise<number> {
        const result = await pool.query(
            `SELECT COUNT(*)::int AS count
     FROM users
     WHERE is_active = true`
        );

        return result.rows[0].count;
    },

    // Update User Password Query 
    async updatePassword(
        id: string,
        passwordHash: string
    ): Promise<User | null> {
        const result = await pool.query(
            `UPDATE users
     SET password_hash = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
            [passwordHash, id]
        );

        return result.rows[0] || null;
    },

    // Count All Active and Deactive Users 
    async countUsers(): Promise<number> {
        const result = await pool.query(
            `SELECT COUNT(*)::int AS count
     FROM users`
        );

        return result.rows[0].count;
    },
};