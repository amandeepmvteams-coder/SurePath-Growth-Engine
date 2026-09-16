import { Request, Response } from "express";
import crypto from "crypto";

import { authService } from "../services/auth.service";

const signSessionToken = (token: string): string => {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
        throw new Error("SESSION_SECRET is not configured");
    }

    const signature = crypto
        .createHmac("sha256", secret)
        .update(token)
        .digest("hex");

    return `${token}.${signature}`;
};

export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const { username, password } = req.body;

        const result = await authService.login(
            username,
            password
        );

        const signedSession = signSessionToken(
            result.sessionToken
        );

        res.setHeader(
            "Set-Cookie",
            `surepath_session=${signedSession}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
        );

        return res.status(200).json({
            user: result.user,
        });
    } catch (error) {
        console.error("Login failed:", error);

        if (
            error instanceof Error &&
            error.message === "No accounts configured"
        ) {
            return res.status(503).json({
                message: "No accounts are configured",
            });
        }

        if (
            error instanceof Error &&
            error.message === "Credentials were not accepted"
        ) {
            return res.status(401).json({
                message: "Credentials were not accepted",
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Logout Controller 
export const logout = async (
    req: Request,
    res: Response
) => {
    try {
        const cookieHeader = req.headers.cookie;

        if (cookieHeader) {
            const cookies = Object.fromEntries(
                cookieHeader.split(";").map((cookie) => {
                    const [key, ...value] = cookie.trim().split("=");

                    return [
                        key,
                        decodeURIComponent(value.join("=")),
                    ];
                })
            );

            const signedSession = cookies.surepath_session;

            if (signedSession) {
                const lastDotIndex =
                    signedSession.lastIndexOf(".");

                if (lastDotIndex !== -1) {
                    const sessionToken =
                        signedSession.substring(0, lastDotIndex);

                    await authService.logout(sessionToken);
                }
            }
        }

        res.setHeader(
            "Set-Cookie",
            "surepath_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
        );

        return res.status(204).send();
    } catch (error) {
        console.error("Logout failed:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const changePassword = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            username,
            current_password,
            new_password,
        } = req.body;

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (req.user.username !== username) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        await authService.changePassword(
            req.user.id,
            current_password,
            new_password
        );

        return res.status(204).send();
    } catch (error) {
        console.error(
            "Password change failed:",
            error
        );

        if (
            error instanceof Error &&
            error.message ===
            "Credentials were not accepted"
        ) {
            return res.status(401).json({
                message: "Credentials were not accepted",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "New password must be different from the current password"
        ) {
            return res.status(400).json({
                message:
                    "New password must be different from the current password",
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};