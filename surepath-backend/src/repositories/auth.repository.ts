import { pool } from "../config/database";
import { User } from "../types/user.types";


export const authRepository = {

    async createSession(
        userId: string,
        sessionTokenHash: string,
        expiresAt: Date
    ) {
        const result = await pool.query(`INSERT INTO sessions
             (user_id, session_token_hash, expires_at)
            VALUES
            ($1,$2,$3)
            RETURNING id, user_id, expires_at, created_at
            `, [userId, sessionTokenHash, expiresAt])

        return result.rows[0];
    },

    async findSession(
        sessionTokenHash: string
    ): Promise<{
        id: string;
        user_id: string;
        expires_at: Date;
        created_at: Date;
    } | null> {
        const result = await pool.query(
            `SELECT id, user_id, expires_at, created_at
       FROM sessions
       WHERE session_token_hash = $1`,
            [sessionTokenHash]
        );

        return result.rows[0] || null;
    },

    async findUserById(
        userId: string
    ): Promise<User | null> {
        const result = await pool.query(
            `SELECT *
       FROM users
       WHERE id = $1`,
            [userId]
        );

        return result.rows[0] || null;
    },

    async updateLastLogin(
        userId: string
    ): Promise<void> {
        await pool.query(
            `UPDATE users
       SET last_login_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
            [userId]
        );
    },
    
    async deleteSession(
        sessionTokenHash: string
    ): Promise<void> {
        await pool.query(
            `DELETE FROM sessions
     WHERE session_token_hash = $1`,
            [sessionTokenHash]
        );
    },
}