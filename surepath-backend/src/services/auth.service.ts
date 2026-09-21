import bcrypt from "bcrypt";
import crypto from "crypto";

import { userRepository } from "../repositories/user.repository";
import { authRepository } from "../repositories/auth.repository";

export const authService = {
    async login(username: string, password: string, keepSignedIn: boolean) {
        const userCount = await userRepository.countUsers();

        if (userCount === 0) {
            const seedUsername = process.env.DASHBOARD_USERNAME;
            const seedPassword = process.env.DASHBOARD_PASSWORD;

            if (!seedUsername || !seedPassword) {
                throw new Error("No accounts configured");
            }
        }

        const user = await userRepository.findByUsername(username);

        if (!user) {
            throw new Error("Credentials were not accepted");
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            throw new Error("Credentials were not accepted");
        }

        if (!user.is_active) {
            throw new Error("Credentials were not accepted");
        }

        const sessionToken = crypto.randomBytes(32).toString("hex");

        const sessionTokenHash = crypto
            .createHash("sha256")
            .update(sessionToken)
            .digest("hex");

        const sessionDuration = keepSignedIn
            ? 1000 * 60 * 60 * 24 * 30
            : 1000 * 60 * 60 * 24;

        const expiresAt = new Date(
            Date.now() + sessionDuration
        );

        await authRepository.createSession(
            user.id,
            sessionTokenHash,
            expiresAt
        );

        await authRepository.updateLastLogin(user.id);

        return {
            sessionToken,
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                email: user.email,
                role: user.role,
                last_login_at: new Date(),
            },
        };
    },

    async logout(sessionToken: string): Promise<void> {
        const sessionTokenHash = crypto
            .createHash("sha256")
            .update(sessionToken)
            .digest("hex");

        await authRepository.deleteSession(
            sessionTokenHash
        );
    },

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new Error("Credentials were not accepted");
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            user.password_hash
        );

        if (!passwordMatches) {
            throw new Error("Credentials were not accepted");
        }

        if (currentPassword === newPassword) {
            throw new Error(
                "New password must be different from the current password"
            );
        }

        const newPasswordHash = await bcrypt.hash(
            newPassword,
            10
        );

        const updatedUser =
            await userRepository.updatePassword(
                user.id,
                newPasswordHash
            );

        if (!updatedUser) {
            throw new Error("Password update failed");
        }
    },
};