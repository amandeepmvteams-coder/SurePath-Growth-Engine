CREATE TABLE ai_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    key VARCHAR(100) NOT NULL,

    prompt_template TEXT NOT NULL,

    model VARCHAR(100) NOT NULL,

    params JSONB NOT NULL DEFAULT '{}'::jsonb,

    version INTEGER NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_configs_key
    ON ai_configs(key);

CREATE INDEX idx_ai_configs_active
    ON ai_configs(key, is_active);

CREATE UNIQUE INDEX idx_ai_configs_active_key
    ON ai_configs(key)
    WHERE is_active = TRUE;