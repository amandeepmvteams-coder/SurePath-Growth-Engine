CREATE TABLE scoring_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    version INTEGER NOT NULL,

    scoring_factors JSONB NOT NULL DEFAULT '{}'::jsonb,

    factor_weights JSONB NOT NULL DEFAULT '{}'::jsonb,

    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,

    attach_rate NUMERIC(38, 10),

    revenue_per_order NUMERIC(38, 10),

    commercial_assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,

    is_active BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (version)
);

CREATE INDEX idx_scoring_configs_is_active
    ON scoring_configs(is_active);

CREATE INDEX idx_scoring_configs_created_at
    ON scoring_configs(created_at);