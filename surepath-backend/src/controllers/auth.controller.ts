import { Request, Response } from "express";
import crypto from "crypto";

import { authService } from "../services/auth.service";

const SESSION_COOKIE_NAME = "surepath_session";
const SESSION_COOKIE_ATTRIBUTES =
    "HttpOnly; Path=/; SameSite=None; Secure";

const buildSessionCookie = (value: string, maxAge: number) =>
    `${SESSION_COOKIE_NAME}=${value}; ${SESSION_COOKIE_ATTRIBUTES}; Max-Age=${maxAge}`;

const extractSignedSession = (cookieHeader?: string): string | null => {
    if (!cookieHeader) {
        return null;
    }

    const cookies = Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
            const [key, ...value] = cookie.trim().split("=");

            return [
                key,
                decodeURIComponent(value.join("=")),
            ];
        })
    );

    return cookies[SESSION_COOKIE_NAME] || null;
};

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
        const {
            username,
            password,
            keepSignedIn,
        } = req.body;

        const result = await authService.login(
            username,
            password,
            keepSignedIn
        );

        const signedSession = signSessionToken(
            result.sessionToken
        );

        // 1 day by default, 30 days when "Keep me signed in" is checked
        const maxAge = keepSignedIn
            ? 60 * 60 * 24 * 30
            : 60 * 60 * 24;

        res.setHeader(
            "Set-Cookie",
            buildSessionCookie(signedSession, maxAge)
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

export const logout = async (
    req: Request,
    res: Response
) => {
    try {
        const signedSession = extractSignedSession(req.headers.cookie);

        if (signedSession) {
            const lastDotIndex = signedSession.lastIndexOf(".");

            if (lastDotIndex !== -1) {
                const sessionToken = signedSession.substring(
                    0,
                    lastDotIndex
                );

                await authService.logout(sessionToken).catch(() => undefined);
            }
        }

        res.setHeader(
            "Set-Cookie",
            buildSessionCookie("", 0)
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