import { pool } from "../config/database";
import { PoolClient } from "pg";
import {
    AIConfig,
    CreateAIConfigInput,
} from "../types/ai-config.types";

class AIConfigRepository {

    async findActiveConfigs(): Promise<AIConfig[]> {

        const result =
            await pool.query<AIConfig>(
                `
                SELECT
                    id,
                    key,
                    prompt_template,
                    model,
                    params,
                    version,
                    is_active
                FROM ai_configs
                WHERE is_active = TRUE
                ORDER BY key ASC
                `
            );

        return result.rows;
    }

    async findActiveByKey(
        key: string
    ): Promise<AIConfig | null> {

        const result =
            await pool.query<AIConfig>(
                `
                SELECT
                    id,
                    key,
                    prompt_template,
                    model,
                    params,
                    version,
                    is_active
                FROM ai_configs
                WHERE key = $1
                  AND is_active = TRUE
                LIMIT 1
                `,
                [key]
            );

        return result.rows[0] || null;
    }

    async createVersion(
        input: CreateAIConfigInput,
        version: number,
        client?: PoolClient
    ): Promise<AIConfig> {

        const db = client ?? pool;

        const result =
            await db.query<AIConfig>(
                `
                INSERT INTO ai_configs (
                    key,
                    prompt_template,
                    model,
                    params,
                    version,
                    is_active
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    TRUE
                )
                RETURNING
                    id,
                    key,
                    prompt_template,
                    model,
                    params,
                    version,
                    is_active
                `,
                [
                    input.key,
                    input.prompt_template,
                    input.model,
                    input.params ?? {},
                    version,
                ]
            );

        return result.rows[0];
    }

    async deactivateByKey(
        key: string,
        client?: PoolClient
    ): Promise<void> {

        const db = client ?? pool;

        await db.query(
            `
            UPDATE ai_configs
            SET is_active = FALSE
            WHERE key = $1
              AND is_active = TRUE
            `,
            [key]
        );
    }

    async getNextVersion(
        key: string,
        client?: PoolClient
    ): Promise<number> {

        const db = client ?? pool;

        const result =
            await db.query<{ max_version: number | null }>(
                `
            SELECT
                MAX(version) AS max_version
            FROM ai_configs
            WHERE key = $1
            `,
                [key]
            );

        const currentVersion =
            result.rows[0]?.max_version ?? 0;

        return currentVersion + 1;
    }

    async createNewVersion(
        input: CreateAIConfigInput
    ): Promise<AIConfig> {

        const client =
            await pool.connect();

        try {

            await client.query("BEGIN");

            /*
             * Get the next version number
             */
            const versionResult =
                await client.query<{
                    max_version: number | null;
                }>(
                    `
                SELECT
                    MAX(version) AS max_version
                FROM ai_configs
                WHERE key = $1
                `,
                    [input.key]
                );

            const currentVersion =
                versionResult.rows[0]?.max_version ?? 0;

            const nextVersion =
                currentVersion + 1;


            /*
             * Deactivate the currently active
             * configuration for this task.
             */
            await client.query(
                `
            UPDATE ai_configs
            SET is_active = FALSE
            WHERE key = $1
              AND is_active = TRUE
            `,
                [input.key]
            );


            /*
             * Create the new active version.
             */
            const result =
                await client.query<AIConfig>(
                    `
                INSERT INTO ai_configs (
                    key,
                    prompt_template,
                    model,
                    params,
                    version,
                    is_active
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    TRUE
                )
                RETURNING
                    id,
                    key,
                    prompt_template,
                    model,
                    params,
                    version,
                    is_active
                `,
                    [
                        input.key,
                        input.prompt_template,
                        input.model,
                        input.params ?? {},
                        nextVersion,
                    ]
                );


            /*
             * Everything succeeded.
             */
            await client.query("COMMIT");

            return result.rows[0];

        } catch (error) {

            /*
             * Something failed.
             * Restore the previous database state.
             */
            await client.query("ROLLBACK");

            throw error;

        } finally {

            /*
             * Always release the connection.
             */
            client.release();
        }
    }
}

export const aiConfigRepository =
    new AIConfigRepository();