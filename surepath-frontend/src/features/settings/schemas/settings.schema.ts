import { z } from "zod";

export const scoringFactorsSchema = z.object({
    contactable: z.boolean(),
    target_country: z.boolean(),
    target_industry: z.boolean(),
    platform_confirmed: z.boolean(),
    no_existing_provider: z.boolean(),
    weak_returns_coverage: z.boolean(),
});

export const factorWeightsSchema = z.object({
    contactable: z.number(),
    target_country: z.number(),
    target_industry: z.number(),
    platform_confirmed: z.number(),
    no_existing_provider: z.number(),
    weak_returns_coverage: z.number(),
});

export const scoringCriteriaSchema = z.object({
    contactable: z.record(z.string(), z.unknown()),
    target_country: z.object({
        countries: z.array(z.string()),
    }),
    target_industry: z.object({
        industries: z.array(z.string()),
    }),
    platform_confirmed: z.object({
        platforms: z.array(z.string()),
    }),
    no_existing_provider: z.record(z.string(), z.unknown()),
    weak_returns_coverage: z.record(z.string(), z.unknown()),
});

export const scoringConfigSchema = z.object({
    id: z.string(),
    version: z.number(),
    scoring_factors: scoringFactorsSchema,
    factor_weights: factorWeightsSchema,
    criteria: scoringCriteriaSchema,
    attach_rate: z.string(),
    revenue_per_order: z.string(),
    commercial_assumptions: z.record(z.string(), z.unknown()),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const teamMemberSchema = z.object({
    id: z.string(),
    username: z.string(),
    display_name: z.string().nullable(),
    email: z.string().nullable(),
    role: z.string(),
    is_active: z.boolean(),
    last_login_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const getTeamMembersResponseSchema = z.object({
    users: z.array(teamMemberSchema),
});

export const aiConfigSchema = z.object({
  id: z.string(),
  key: z.string(),
  prompt_template: z.string(),
  model: z.string(),
  params: z.record(z.string(), z.unknown()),
  version: z.number(),
  is_active: z.boolean(),
});

export const aiConfigsSchema = z.array(aiConfigSchema);