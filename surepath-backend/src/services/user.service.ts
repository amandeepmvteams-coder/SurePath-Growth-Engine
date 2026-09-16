import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { UpdateUserData, User } from "../types/user.types";

export const userService = {

    // Get All Users Service 
    async getAllUsers(): Promise<User[]> {
        return await userRepository.findAll();
    },
    // Get Users By ID Service 
    async getUserById(id: string): Promise<User | null> {
        return await userRepository.findById(id);
    },

    // Get User By Username Service 
    async getUserByUsername(username: string): Promise<User | null> {
        return await userRepository.findByUsername(username);
    },

    // Create User Service 
    async createUser(
        username: string,
        displayName: string | null,
        email: string | null,
        password: string,
        role: string = "user"
    ): Promise<User> {
        const existingUser = await userRepository.findByUsername(username);

        if (existingUser) {
            throw new Error("Username already exists");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        return await userRepository.createUser(
            username,
            displayName,
            email,
            passwordHash,
            role
        );
    },

    // Get Active Users Service 
    async getActiveUsers(): Promise<User[]> {
        return await userRepository.findAllActive();
    },

    // Update User Service 
    async updateUser(
        id: string,
        data: UpdateUserData
    ): Promise<User> {
        const existingUser = await userRepository.findById(id);

        if (!existingUser) {
            throw new Error("User not found");
        }

        if (
            data.is_active === false &&
            existingUser.is_active === true
        ) {
            const activeUserCount = await userRepository.countActiveUsers();

            if (activeUserCount <= 1) {
                throw new Error(
                    "Cannot deactivate the final active user"
                );
            }
        }

        const updatedUser = await userRepository.updateUser(
            id,
            data
        );

        if (!updatedUser) {
            throw new Error("User update failed");
        }

        return updatedUser;
    },

    // Reset Password Service 
    async resetPassword(
        id: string,
        password: string
    ): Promise<User> {
        const existingUser = await userRepository.findById(id);

        if (!existingUser) {
            throw new Error("User not found");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const updatedUser = await userRepository.updatePassword(
            id,
            passwordHash
        );

        if (!updatedUser) {
            throw new Error("Password reset failed");
        }

        return updatedUser;
    },
};