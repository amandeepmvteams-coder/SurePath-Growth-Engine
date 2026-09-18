import { apiClient } from "@/lib/api/client";
import { usersResponseSchema } from "../schemas/user.schema";
import type { User } from "../types/user.types";

export async function getActiveUsers(): Promise<User[]> {
    const response = await apiClient.get("/api/v1/users", {
        params: {
            active_only: true,
        },
    });

    const validatedResponse =
        usersResponseSchema.parse(response.data);

    return validatedResponse.users;
}