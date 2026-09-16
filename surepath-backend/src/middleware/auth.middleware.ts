import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

import { authRepository } from "../repositories/auth.repository";

export const requireSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return res.status(401).json({
        message: "Authentication required",
      });
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

    const signedSession = cookies.surepath_session;

    if (!signedSession) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const lastDotIndex = signedSession.lastIndexOf(".");

    if (lastDotIndex === -1) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    const sessionToken = signedSession.substring(
      0,
      lastDotIndex
    );

    const receivedSignature = signedSession.substring(
      lastDotIndex + 1
    );

    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      console.error("SESSION_SECRET is not configured");

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(sessionToken)
      .digest("hex");

    const signaturesMatch =
      receivedSignature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(receivedSignature),
        Buffer.from(expectedSignature)
      );

    if (!signaturesMatch) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    const sessionTokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const session = await authRepository.findSession(
      sessionTokenHash
    );

    if (!session) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    if (new Date(session.expires_at) <= new Date()) {
      return res.status(401).json({
        message: "Session expired",
      });
    }

    const user = await authRepository.findUserById(
      session.user_id
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Session authentication failed:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};