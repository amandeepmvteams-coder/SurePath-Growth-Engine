import { Request, Response, NextFunction } from "express";

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {

    const apiKey = req.header("X-API-Key");
    const expectedApiKey = process.env.API_KEY;

    if (!expectedApiKey || apiKey !== expectedApiKey) {
        return res.status(401).json({
            detail: "Missing or invalid API key.",
        });
    }

    next();
}