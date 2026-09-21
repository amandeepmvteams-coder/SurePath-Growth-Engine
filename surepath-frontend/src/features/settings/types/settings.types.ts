export interface ScoringFactors {
    contactable: boolean;
    target_country: boolean;
    target_industry: boolean;
    platform_confirmed: boolean;
    no_existing_provider: boolean;
    weak_returns_coverage: boolean;
}

export interface FactorWeights {
    contactable: number;
    target_country: number;
    target_industry: number;
    platform_confirmed: number;
    no_existing_provider: number;
    weak_returns_coverage: number;
}

export interface ScoringCriteria {
    contactable: Record<string, unknown>;
    target_country: {
        countries: string[];
    };
    target_industry: {
        industries: string[];
    };
    platform_confirmed: {
        platforms: string[];
    };
    no_existing_provider: Record<string, unknown>;
    weak_returns_coverage: Record<string, unknown>;
}

export interface ScoringConfig {
    id: string;
    version: number;
    scoring_factors: ScoringFactors;
    factor_weights: FactorWeights;
    criteria: ScoringCriteria;
    attach_rate: string;
    revenue_per_order: string;
    commercial_assumptions: Record<string, unknown>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: string;
    username: string;
    display_name: string | null;
    email: string | null;
    role: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface GetTeamMembersResponse {
    users: TeamMember[];
}
export interface AIConfig {
  id: string;
  key: string;
  prompt_template: string;
  model: string;
  params: Record<string, unknown>;
  version: number;
  is_active: boolean;
}

export interface UpdateScoringConfigData {
  scoring_factors?: Record<string, unknown>;
  factor_weights?: Record<string, unknown>;
  criteria?: Record<string, unknown>;
  attach_rate?: number | null;
  revenue_per_order?: number | null;
  commercial_assumptions?: Record<string, unknown>;
}

export interface UpdateAIConfigData {
  key: string;
  prompt_template: string;
  model: string;
  params?: Record<string, unknown>;
}

export interface CreateUserData {
  username: string;
  display_name?: string;
  email?: string;
  password: string;
  role?: string;
}

export interface CreateUserResponse {
  message: string;
  user: TeamMember;
}

export interface UpdateUserData {
  display_name?: string | null;
  email?: string | null;
  role?: string;
  is_active?: boolean;
}

export interface UpdateUserResponse {
  message: string;
  user: TeamMember;
}

export interface ResetPasswordData {
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordData {
    username: string;
    current_password: string;
    new_password: string;
}