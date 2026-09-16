import { Router } from "express";
import { pool } from "../config/database";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({
            status: "ok",
            version: process.env.npm_package_version,
            environment: process.env.APP_ENVIRONMENT,
            database: "ok",
        });
    } catch (error) {
        console.error("Database health check failed:", error);

        res.status(503).json({
            status: "ok",
            version: process.env.npm_package_version,
            environment: process.env.APP_ENVIRONMENT,
            database: "error",
        });
    }
})

export default router;