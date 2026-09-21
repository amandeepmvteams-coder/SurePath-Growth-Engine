import { apiClient } from "@/lib/api/client";
import { aiConfigSchema, getTeamMembersResponseSchema, scoringConfigSchema, aiConfigsSchema } from "../schemas/settings.schema";
import type {
    ScoringConfig,
    TeamMember,
    GetTeamMembersResponse,
    AIConfig,
    UpdateAIConfigData,
    CreateUserData,
    CreateUserResponse,
    UpdateUserData,
    UpdateUserResponse,
    ResetPasswordData,
    ResetPasswordResponse,
    UpdateScoringConfigData,
    ChangePasswordData,
} from "../types/settings.types";


export async function getScoringConfig(): Promise<ScoringConfig> {
    const response = await apiClient.get("/api/v1/scoring/config");

    return scoringConfigSchema.parse(response.data);
}
export async function getTeamMembers(): Promise<GetTeamMembersResponse> {
    const response = await apiClient.get(
        "/api/v1/users?active_only=true"
    );

    return getTeamMembersResponseSchema.parse(response.data);
}

export async function getAIConfigs(): Promise<AIConfig[]> {
    const response = await apiClient.get("/api/v1/ai/configs");
    return aiConfigsSchema.parse(response.data);
}

export async function updateScoringConfig(
    data: UpdateScoringConfigData
): Promise<ScoringConfig> {
    const response = await apiClient.put(
        "/api/v1/scoring/config",
        data
    );

    return scoringConfigSchema.parse(response.data);
}

export async function updateAIConfig(
    data: UpdateAIConfigData
): Promise<AIConfig> {
    const response = await apiClient.put(
        "/api/v1/ai/configs",
        data
    );

    return aiConfigSchema.parse(response.data);
}

export async function createUser(
  data: CreateUserData
): Promise<CreateUserResponse> {
  const response = await apiClient.post(
    "/api/v1/users",
    data
  );

  return response.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserData
): Promise<UpdateUserResponse> {
  const response = await apiClient.patch(
    `/api/v1/users/${id}`,
    data
  );

  return response.data;
}

export async function resetUserPassword(
  id: string,
  data: ResetPasswordData
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post(
    `/api/v1/users/${id}/password`,
    data
  );

  return response.data;
}



export async function changePassword(
    data: ChangePasswordData
): Promise<void> {
    await apiClient.post(
        "/api/v1/auth/password",
        data
    );
}