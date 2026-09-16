import { pool } from "../config/database";
import {
    Industry,
} from "../types/industry.types";

class IndustryRepository {

    async findAllActive(): Promise<Industry[]> {

        const result =
            await pool.query<Industry>(
                `
                SELECT
                    id,
                    name,
                    is_active,
                    created_at
                FROM industries
                WHERE is_active = TRUE
                ORDER BY name ASC
                `
            );

        return result.rows;
    }
}

export const industryRepository =
    new IndustryRepository();