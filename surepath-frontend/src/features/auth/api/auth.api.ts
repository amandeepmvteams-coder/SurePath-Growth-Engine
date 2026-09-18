import { apiClient } from "@/lib/api/client";

import {
    loginResponseSchema,
} from "../schemas/auth.schema";

import type {
    LoginRequest,
    LoginResponse,
} from "../types/auth.types";

export async function login(
    credentials: LoginRequest
): Promise<LoginResponse> {
    const response = await apiClient.post(
        "/api/v1/auth/login",
        credentials
    );

    return loginResponseSchema.parse(response.data);
}

export async function getCurrentUser(): Promise<LoginResponse> {
    const response = await apiClient.get("/api/v1/users/me");

    return loginResponseSchema.parse(response.data);
}

export async function logout(): Promise<void> {
    await apiClient.post("/api/v1/auth/logout");
}